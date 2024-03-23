// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod keybinds;
use keybinds::key_to_string;
use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};
use std::{fs, path, string};
use rdev::EventType;
use futures::{
    channel::mpsc::{channel, Receiver},
    SinkExt, StreamExt,
};
use notify::{event::ModifyKind, Config, Event, RecommendedWatcher, RecursiveMode, Watcher};
use std::path::Path;

#[derive(Clone, serde::Serialize)]
struct PayloadKeypress {
  message: String,
}

#[derive(Clone, serde::Serialize)]
struct PayloadCreateWindow {
  title: String,
  id: String,
  path: String,
}

#[derive(Clone, serde::Serialize)]
struct PayloadFileChange {
  message: String,
  path: String,
}

#[tauri::command]
fn get_module_names() -> Vec<string::String>{
    let mut modules = Vec::new(); 
    for entry in fs::read_dir("../overfloat_modules").unwrap(){
        let entry=entry.unwrap();
        let path=entry.path();
        if path.is_dir(){
            let p: path::PathBuf = path.iter()
                .skip_while(|s| *s != "overfloat_modules")
                .skip(1)
                .collect();

            modules.push(p.into_os_string().into_string().unwrap());
        }
    }

    modules
}

fn create_async_watcher() -> notify::Result<(RecommendedWatcher, Receiver<notify::Result<Event>>)> {
    let (mut tx, rx) = channel(1);

    // Automatically select the best implementation for your platform.
    // You can also access each implementation directly e.g. INotifyWatcher.
    let watcher = RecommendedWatcher::new(
        move |res| {
            futures::executor::block_on(async {
                tx.send(res).await.unwrap();
            })
        },
        Config::default(),
    )?;

    Ok((watcher, rx))
}

#[tauri::command]
async fn watch_file(path: String, handle: tauri::AppHandle){
    tauri::async_runtime::spawn(async {
        if let Err(e) = async_watch(path, handle).await {
            println!("error: {:?}", e)
        }
    });
}

async fn async_watch(path: String, handle: tauri::AppHandle) -> notify::Result<()> {
    let (mut watcher, mut rx) = create_async_watcher()?;

    let file_path = Path::new(&path);

    // Add a path to be watched. All files and directories at that path and
    // below will be monitored for changes.
    watcher.watch(file_path, RecursiveMode::NonRecursive)?;

    while let Some(res) = rx.next().await {
        match res {
            Ok(event) => {
                if event.kind == notify::EventKind::Modify(ModifyKind::Any) {
                    println!("modified: {:?}", event);
                    handle.emit_all("overfloat://FileChange", PayloadFileChange { path: {format!("{}", path)}, message: format!("File {} changed", path)}).unwrap();
                }
            },
            Err(e) => println!("watch error: {:?}", e),
        }
    }

    Ok(())
}

fn main() {
    /*
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let central = CustomMenuItem::new("central".to_string(), "Central");
    */
    let _module_names : Vec<string::String> = get_module_names();
    
    /* 
    let tray_menu = SystemTrayMenu::new(); // insert the menu items here
    for module in get_module_names(){
        let m = CustomMenuItem::new(module.clone(), module.clone());
        tray_menu.as_ref().add_item(m);
    }
    */
    let central = CustomMenuItem::new("central".to_string(), "Central");
    let file_watcher = CustomMenuItem::new("file_watcher".to_string(), "File Watcher");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new().add_item(central).add_item(file_watcher).add_native_item(SystemTrayMenuItem::Separator).add_item(quit);



    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();

            //Keybind event firing
            /*
            mki::bind_any_key(Action::handle_kb(move |key| {
                println!("MKI Keypress: {:?}", key); 
                handle.emit_all("overfloat://GlobalKeyPress", PayloadKeypress { message: format!("{} from mki", key)}).unwrap();
            }));
            */
                        
                        
            //fn callback(event: rdev::Event) {
            
            let callback = move |event: rdev::Event| {
                match event.event_type {
                    EventType::KeyPress(key) => {
                            //println!("RDEV Keypress: {:?}\t{:?}", key, event.time);
                            
                            handle.emit_all("overfloat://GlobalKeyPress", PayloadKeypress { message: key_to_string(key)}).unwrap();   
                        },
                    _ => {},
                }
            };
            
            tauri::async_runtime::spawn(async move {
                if let Err(error) = rdev::listen(callback) {
                    println!("Error: {:?}", error)
                }
            });
            
            
            Ok(())
        })
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(|app, event| match event {
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
            "quit" => {
                std::process::exit(0);
            }
            "file_watcher" => {
                app.emit_all("overfloat://CreateWindow", PayloadCreateWindow { title: "File Watcher".to_string(), id: "file_watcher".to_string(), path: "file_watcher".to_string()}).unwrap();
            }
            "central" => {
                app.emit_all("overfloat://CreateWindow", PayloadCreateWindow { title: "Central".to_string(), id: "central".to_string(), path: "central".to_string()}).unwrap();
            }
            _ => {}
            }
        }
        _ => {}
        })
        .invoke_handler(tauri::generate_handler![get_module_names, watch_file])
        .device_event_filter(tauri::DeviceEventFilter::Always)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
}
