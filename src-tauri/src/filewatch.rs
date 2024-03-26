use std::path::Path;
use tauri::{self, Manager};

use futures::{
    channel::mpsc::{channel, Receiver},
    SinkExt, StreamExt,
};

use notify::Watcher;


#[derive(Clone, serde::Serialize)]
struct PayloadFileChange {
  message: String,
  path: String,
}

pub async fn async_watch(path: String, handle: tauri::AppHandle) -> notify::Result<()> {
    let (mut watcher, mut rx) = create_async_watcher()?;

    let file_path = Path::new(&path);

    // Add a path to be watched. All files and directories at that path and
    // below will be monitored for changes.
    watcher.watch(file_path, notify::RecursiveMode::NonRecursive)?;

    while let Some(res) = rx.next().await {
        match res {
            Ok(event) => {
                if event.kind == notify::EventKind::Modify(notify::event::ModifyKind::Any) {
                    println!("modified: {:?}", event);
                    //handle.emit_all("", {});
                    handle.emit_all("overfloat://FileChange", PayloadFileChange { path: {format!("{}", path)}, message: format!("File {} changed", path)}).unwrap();
                }
            },
            Err(e) => println!("watch error: {:?}", e),
        }
    }

    Ok(())
}

fn create_async_watcher() -> notify::Result<(notify::RecommendedWatcher, Receiver<notify::Result<notify::Event>>)> {
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