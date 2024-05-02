/*****************************************************************************
 * @FilePath              : src-tauri/src/fswatch.rs                         *
 * @Author                : Jakub Šediba <xsedib00@vutbr.cz>                 *
 * @Year                  : 2024                                             *
 ****************************************************************************/

use std::{collections::HashMap, path::PathBuf};
use tauri::{self, Manager};

use notify::{
    event::{ModifyKind, RemoveKind, RenameMode},
    EventKind, Watcher,
};

use futures::{
    channel::mpsc::channel,
    SinkExt, StreamExt,
};

use lazy_static::lazy_static;
use std::sync::Mutex;

/*
* Lazily initialized global instance of WatchedPaths used for tracking watched paths
* This has to be global because it needs to be accessible from tauri commands
*/
lazy_static! {
    static ref WATCHED_PATHS: Mutex<WatchedPaths> = Mutex::new(WatchedPaths::new());
}

/*
* Get the global instance of WatchedPaths
*/
fn get_watched_paths() -> &'static Mutex<WatchedPaths> {
    &WATCHED_PATHS
}

// Struct for tracking watched paths
struct WatchedPaths {
    watched_paths: HashMap<String, HashMap<String, tauri::async_runtime::JoinHandle<()>>>,
}

// Implementation of WatchedPaths
impl WatchedPaths {
    fn new() -> WatchedPaths {
        WatchedPaths {
            watched_paths: HashMap::new(),
        }
    }

    /**
     * @brief Remove watched path from the watched paths
     * @param window_label - label of the window
     * @param id - id of the watched path
     */
    fn remove_watched_path(&mut self, window_label: &String, id: &String) {
        // Get the watched paths for the window
        match self.watched_paths.get_mut(window_label) {
            // Get the task for the watched path
            Some(map) => match map.get(id) {
                Some(task) => {
                    // Abort the task and remove it from the map
                    task.abort();
                    map.remove(id);
                }
                None => {}
            },
            None => {}
        }
    }

    /**
     * @brief Add watched path to the watched paths
     * @param window_label - label of the window
     * @param id - id of the watched path
     * @param task - task for the watched path
     */
    fn add_watched_path(
        &mut self,
        window_label: &String,
        id: &String,
        task: tauri::async_runtime::JoinHandle<()>,
    ) {
        // Get the watched paths map for the window or create new one
        let window_taskes = self
            .watched_paths
            .entry(window_label.to_owned())
            .or_insert(HashMap::new());

        // Insert the task to the map
        window_taskes.insert(id.to_owned(), task);
    }
}

/**
 * @brief Remove watched path from the watched paths
 * @param window_label - label of the window
 * @param id - id of the watched path
 * @note Exposes the operation to tauri commands
 */
pub fn remove_watched_path(window_label: &String, id: &String) {
    let mut watched_paths = get_watched_paths().lock().unwrap();
    watched_paths.remove_watched_path(window_label, id);
}

/**
 * @brief Add watched path to the watched paths
 * @param window_label - label of the window
 * @param id - id of the watched path
 * @param task - task for the watched path
 * @note Exposes the operation to tauri commands
 */
pub fn add_watched_path(
    window_label: &String,
    id: &String,
    task: tauri::async_runtime::JoinHandle<()>,
) {
    let mut watched_paths = get_watched_paths().lock().unwrap();
    watched_paths.add_watched_path(window_label, id, task);
}

// Struct for payload of file change event
#[derive(Clone, serde::Serialize)]
struct PayloadFileChange {
    kind: u64,
    is_dir: bool,
    path: String,
    path_old: String,
    timestamp: u128,
}

/**
 * @brief Emit file change event
 * @param handle - tauri app handle
 * @param window_label - label of the window
 * @param id - id of the watched path
 * @param kind - kind of the event
 * @param is_dir - is the path a directory
 * @param path - path of the event
 * @param path_old - old path of the event
 */
fn emit_filechange(
    handle: &tauri::AppHandle,
    window_label: &String,
    id: &String,
    kind: u64,
    is_dir: bool,
    path: &std::path::PathBuf,
    path_old: &std::path::PathBuf,
) {
    // Emit the event to the window with specified label
    let _ = handle.emit_to(
        window_label.as_str(),
        format!("Overfloat://FSEvent/{}", id).as_str(),
        PayloadFileChange {
            kind: kind,
            is_dir: is_dir,
            path: path.as_path().to_string_lossy().to_string(),
            path_old: path_old.as_path().to_string_lossy().to_string(),
            timestamp: std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_millis(),
        },
    );
}

/**
 * @brief Handle file system watch event on Linux
 * @param event - file system watch event
 * @param handle - tauri app handle
 * @param window_label - label of the window
 * @param id - id of the watched path
 * @note This function is used only on Linux and
 * therefore has to be marked with dead_code attribute
 */
#[allow(dead_code)]
fn handle_fswatch_event_linux(
    event: notify::Event,
    handle: &tauri::AppHandle,
    window_label: &String,
    id: &String,
) {
    // Get the path of the event
    let path: &PathBuf = match event.paths.get(0) {
        Some(value) => value,
        None => return,
    };

    // Get the old path of the event, if it is not present use the path
    let path_old: &PathBuf = match event.paths.get(1) {
        Some(value) => value,
        None => path,
    };

    // Check if the path is a directory
    let is_dir: bool = match std::fs::metadata(path) {
        Ok(result) => result.is_dir(),
        Err(_) => false,
    };

    // Handle the event based on the kind
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

/*
* Lazily initialized global instance of LAST_RENAME_FROM used for tracking last rename from path
* Only used on Windows, since Notify does not combine rename events on Windows
* This has to be global because it needs to keep the state between multiple events
*/
lazy_static! {
    static ref LAST_RENAME_FROM: Mutex<PathBuf> = Mutex::new(PathBuf::from("/")); // Initialize with default value
}

/**
 * @brief Handle file system watch event on Windows
 * @param event - file system watch event
 * @param handle - tauri app handle
 * @param window_label - label of the window
 * @param id - id of the watched path
 * @note This function is used only on Windows and
 * therefore has to be marked with dead_code attribute
 */
#[allow(dead_code)]
fn handle_fswatch_event_windows(
    event: notify::Event,
    handle: &tauri::AppHandle,
    window_label: &String,
    id: &String,
) {
    // Get the path of the event
    let path: &PathBuf = match event.paths.get(0) {
        Some(value) => value,
        None => return,
    };

    // Check if the path is a directory
    let is_dir: bool = match std::fs::metadata(path) {
        Ok(result) => result.is_dir(),
        Err(_) => false,
    };

    // Handle the event based on the kind
    match event.kind {
        EventKind::Create(_) => {
            emit_filechange(&handle, &window_label, &id, 0, is_dir, path, path);
        }
        EventKind::Modify(ModifyKind::Name(RenameMode::From)) => {
            // Save the path of the RenameFrom event in the global variable
            let mut last_rename_from = LAST_RENAME_FROM.lock().unwrap();
            *last_rename_from = path.to_path_buf();
        }
        EventKind::Modify(ModifyKind::Name(RenameMode::To)) => {
            // Get the path from the last RenameFrom event
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

/**
 * @brief Watch the path for file system changes
 * @param handle - tauri app handle
 * @param path_str - path to watch
 * @param window_label - label of the window to emit the events to
 * @param id - id of the watched path
 */
pub async fn async_watch(
    handle: tauri::AppHandle,
    path_str: String,
    window_label: String,
    id: String,
) -> notify::Result<()> {
    // Create the channel for the watcher
    let (mut tx, mut rx) = channel(1);

    // Create the watcher
    let mut watcher = notify::RecommendedWatcher::new(
        move |res| {
            futures::executor::block_on(async {
                tx.send(res).await.unwrap();
            })
        },
        notify::Config::default(),
    )?;

    // Create the path from the path string
    let path = std::path::Path::new(&path_str);

    // Add the watched path to the watcher
    watcher.watch(path, notify::RecursiveMode::Recursive)?;

    // Handle the events
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