use std::collections::HashMap;
use tauri::{self, Manager};

use notify::{RecursiveMode, Watcher};
use notify_debouncer_full::new_debouncer;

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
                    println!("Killing process for {}: {}", window_label, id);
                    println!("{:?}", process);
                    tauri::async_runtime::
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

        println!("Setting process for {}: {}", window_label, id);
        println!("{:?}", process);

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
    path: String,
    kind: String,
}

pub async fn async_watch(
    _handle: tauri::AppHandle,
    path_str: String,
    _window_label: String,
    _id: String,
) -> notify::Result<()> {
    //let (mut watcher, mut rx) = create_async_watcher()?;

    let path = std::path::Path::new(&path_str);

    // setup debouncer
    let (tx, rx) = std::sync::mpsc::channel();

    // no specific tickrate, max debounce time 2 seconds
    let mut debouncer = new_debouncer(std::time::Duration::from_secs(1), None, tx)?;

    debouncer
        .watcher()
        .watch(path, RecursiveMode::Recursive)
        .unwrap();
    debouncer.cache().add_root(path, RecursiveMode::Recursive);

    // print all events and errors
    for result in rx {
        match result {
            Ok(events) => events.iter().for_each(|event| println!("{event:?}")),
            Err(errors) => errors.iter().for_each(|error| println!("{error:?}")),
        }
        println!();
    }

    /*
    watcher.watch(path, notify::RecursiveMode::Recursive)?;

    while let Some(res) = rx.next().await {
        println!("{:?}", res);
        match res {
            Ok(event) => {
                let _ = handle.emit_to(
                    window_label.as_str(),
                    format!("Overfloat://FSEvent/{}", id).as_str(),
                    PayloadFileChange {
                        path: event.paths.first().unwrap().to_string_lossy().to_string(),
                        kind: format!("{:?}", event.kind),
                    },
                );
            }
            Err(e) => {println!("{:?}", e)}
        }
    }
    */

    Ok(())
}

/*
fn create_async_watcher() -> notify::Result<(
    notify::RecommendedWatcher,
    Receiver<notify::Result<notify::Event>>,
)> {
    let (mut tx, rx) = channel(1);

    // Automatically select the best implementation for your platform.
    // You can also access each implementation directly e.g. INotifyWatcher.
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
*/
