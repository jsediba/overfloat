use std::collections::HashMap;
use tauri::{self, Manager};

use notify::{event::ModifyKind, event::RenameMode, EventKind, Watcher};

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
}

fn emit_filechange(
    handle: &tauri::AppHandle,
    window_label: &String,
    id: &String,
    kind: u64,
    path: &std::path::PathBuf,
    path_old: &std::path::PathBuf,
) {
    let _ = handle.emit_to(
        window_label.as_str(),
        format!("Overfloat://FSEvent/{}", id).as_str(),
        PayloadFileChange {
            kind: kind,
            is_dir: std::fs::metadata(path).unwrap().is_dir(),
            path: path.as_path().to_string_lossy().to_string(),
            path_old: path_old.as_path().to_string_lossy().to_string(),
        },
    );
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
                match event.kind {
                    EventKind::Create(_) => {
                        let path = event.paths.get(0).unwrap();
                        emit_filechange(&handle, &window_label, &id, 0, path, path);
                    }
                    EventKind::Remove(_) => {
                        let path = event.paths.get(0).unwrap();
                        emit_filechange(&handle, &window_label, &id, 1, path, path);
                    }
                    EventKind::Modify(ModifyKind::Data(_)) => {
                        let path = event.paths.get(0).unwrap();
                        emit_filechange(&handle, &window_label, &id, 2, path, path);
                    }
                    EventKind::Modify(ModifyKind::Name(RenameMode::Both)) => {
                        let path_old = event.paths.get(0).unwrap();
                        let path_new = event.paths.get(1).unwrap();
                        emit_filechange(&handle, &window_label, &id, 3, path_new, path_old);
                    }
                    _ => {}
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
