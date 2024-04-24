use std::{collections::HashMap, path::PathBuf};
use tauri::{self, Manager};

use notify::{
    event::{ModifyKind, RemoveKind, RenameMode},
    EventKind, Watcher,
};

use futures::{
    channel::mpsc::{channel, Receiver},
    SinkExt, StreamExt,
};

use lazy_static::lazy_static;
use std::sync::Mutex;

lazy_static! {
    static ref WATCHED_PATHS: Mutex<WatchedPaths> = Mutex::new(WatchedPaths::new()); // Initialize with default value
}

fn get_watched_paths() -> &'static Mutex<WatchedPaths> {
    &WATCHED_PATHS
}

struct WatchedPaths {
    watched_paths: HashMap<String, HashMap<String, tauri::async_runtime::JoinHandle<()>>>,
}

impl WatchedPaths {
    fn new() -> WatchedPaths {
        WatchedPaths {
            watched_paths: HashMap::new(),
        }
    }

    fn remove_watched_path(&mut self, window_label: &String, id: &String) {
        match self.watched_paths.get_mut(window_label) {
            Some(map) => match map.get(id) {
                Some(process) => {
                    process.abort();
                    map.remove(id);
                }
                None => {}
            },
            None => {}
        }
    }

    fn add_watched_path(
        &mut self,
        window_label: &String,
        id: &String,
        process: tauri::async_runtime::JoinHandle<()>,
    ) {
        let window_processes = self
            .watched_paths
            .entry(window_label.to_owned())
            .or_insert(HashMap::new());

        window_processes.insert(id.to_owned(), process);
    }
}

pub fn remove_watched_path(window_label: &String, id: &String) {
    let mut watched_paths = get_watched_paths().lock().unwrap();
    watched_paths.remove_watched_path(window_label, id);
}

pub fn add_watched_path(
    window_label: &String,
    id: &String,
    process: tauri::async_runtime::JoinHandle<()>,
) {
    let mut watched_paths = get_watched_paths().lock().unwrap();
    watched_paths.add_watched_path(window_label, id, process);
}

#[derive(Clone, serde::Serialize)]
struct PayloadFileChange {
    kind: u64,
    is_dir: bool,
    path: String,
    path_old: String,
    timestamp: u128,
}

fn emit_filechange(
    handle: &tauri::AppHandle,
    window_label: &String,
    id: &String,
    kind: u64,
    is_dir: bool,
    path: &std::path::PathBuf,
    path_old: &std::path::PathBuf,
) {
    let _ = handle.emit_to(
        window_label.as_str(),
        format!("Overfloat://FSEvent/{}", id).as_str(),
        PayloadFileChange {
            kind: kind,
            is_dir: is_dir,
            path: path.as_path().to_string_lossy().to_string(),
            path_old: path_old.as_path().to_string_lossy().to_string(),
            timestamp: std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_millis(),
        },
    );
}

#[allow(dead_code)]
fn handle_fswatch_event_linux(
    event: notify::Event,
    handle: &tauri::AppHandle,
    window_label: &String,
    id: &String,
) {

    let path: &PathBuf = match event.paths.get(0) {
        Some(value) => value,
        None => return
    };

    let path_old: &PathBuf = match event.paths.get(1) {
        Some(value) => value,
        None => path
    };

    let is_dir: bool = match std::fs::metadata(path){
        Ok(result) => result.is_dir(),
        Err(_) => false, 
    };

    match event.kind {
        EventKind::Create(_) => {
            emit_filechange(&handle, &window_label, &id, 0, is_dir, path, path_old);
        }
        EventKind::Remove(RemoveKind::File) => {
            emit_filechange(&handle, &window_label, &id, 1, false, path, path_old);
        }
        EventKind::Remove(RemoveKind::Folder) => {
            emit_filechange(&handle, &window_label, &id, 1, true, path, path_old);
        }
        EventKind::Modify(ModifyKind::Data(_)) => {
            emit_filechange(&handle, &window_label, &id, 2, is_dir, path, path_old);
        }
        EventKind::Modify(ModifyKind::Name(RenameMode::Both)) => {
            emit_filechange(&handle, &window_label, &id, 3, is_dir, path, path_old);
        }
        _ => {}
    }
}

lazy_static! {
    static ref LAST_RENAME_FROM: Mutex<PathBuf> = Mutex::new(PathBuf::from("/")); // Initialize with default value
}

#[allow(dead_code)]
fn handle_fswatch_event_windows(
    event: notify::Event,
    handle: &tauri::AppHandle,
    window_label: &String,
    id: &String,
) {
    let path: &PathBuf = match event.paths.get(0) {
        Some(value) => value,
        None => return
    };

    let is_dir: bool = match std::fs::metadata(path){
        Ok(result) => result.is_dir(),
        Err(_) => false, 
    };

    match event.kind {
        EventKind::Create(_) => {
            emit_filechange(&handle, &window_label, &id, 0, is_dir, path, path);
        }
        EventKind::Modify(ModifyKind::Name(RenameMode::From)) => {
            let mut last_rename_from = LAST_RENAME_FROM.lock().unwrap();
            *last_rename_from = path.to_path_buf(); 
        }
        EventKind::Modify(ModifyKind::Name(RenameMode::To)) => {
            let last_rename_from = LAST_RENAME_FROM.lock().unwrap();
            let path_old: &PathBuf = &(*last_rename_from);
            emit_filechange(handle, window_label, id, 3, is_dir, path, path_old)
        }


        EventKind::Modify(ModifyKind::Any) => {
            emit_filechange(&handle, &window_label, &id, 2, is_dir, path, path);
        }
        EventKind::Remove(RemoveKind::Any) => {
            emit_filechange(&handle, &window_label, &id, 1, false, path, path);
        }
        _ => {}
    }
}

pub async fn async_watch(
    handle: tauri::AppHandle,
    path_str: String,
    window_label: String,
    id: String,
) -> notify::Result<()> {
    let (mut watcher, mut rx) = create_async_watcher()?;

    let path = std::path::Path::new(&path_str);

    watcher.watch(path, notify::RecursiveMode::Recursive)?;

    while let Some(res) = rx.next().await {
        match res {
            Ok(event) => {
                #[cfg(target_os = "linux")]
                {
                    handle_fswatch_event_linux(event, &handle, &window_label, &id)
                }
                #[cfg(target_os = "windows")]
                {
                    handle_fswatch_event_windows(event, &handle, &window_label, &id);
                }
            }
            Err(_) => {}
        }
    }

    Ok(())
}

fn create_async_watcher() -> notify::Result<(
    notify::RecommendedWatcher,
    Receiver<notify::Result<notify::Event>>,
)> {
    let (mut tx, rx) = channel(1);

    let watcher = notify::RecommendedWatcher::new(
        move |res| {
            futures::executor::block_on(async {
                tx.send(res).await.unwrap();
            })
        },
        notify::Config::default(),
    )?;

    Ok((watcher, rx))
}
