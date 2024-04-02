use std::path::Path;
use tauri::{self, Manager};

use futures::{
    channel::mpsc::{channel, Receiver},
    SinkExt, StreamExt,
};

use notify::Watcher;

#[derive(Clone, serde::Serialize)]
struct PayloadFileChange {
    path: String,
    kind: String,
}

pub async fn async_watch(
    handle: tauri::AppHandle,
    path: String,
    window_label: String,
    id: String,
) -> notify::Result<()> {
    let (mut watcher, mut rx) = create_async_watcher()?;

    let file_path = Path::new(&path);

    // Add a path to be watched. All files and directories at that path and
    // below will be monitored for changes.

    watcher.watch(file_path, notify::RecursiveMode::Recursive)?;

    while let Some(res) = rx.next().await {
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
