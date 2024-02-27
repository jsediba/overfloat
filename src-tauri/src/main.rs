// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use mki::{Action};
use tauri::{self, Manager, CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use std::{fs, path, string};
use rdev::{Key, EventType};

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

#[tauri::command]
async fn send_a() {
    println!("Sending A");
    let _res = rdev::simulate(&EventType::KeyPress(Key::KeyA));
}

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


fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let central = CustomMenuItem::new("central".to_string(), "Central");
    let tray_menu = SystemTrayMenu::new().add_item(central).add_item(quit); // insert the menu items here

    let _module_names : Vec<string::String> = get_module_names();


    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();

            //Keybind event firing
            mki::bind_any_key(Action::handle_kb(move |key| {
                println!("MKI Keypress: {:?}", key); 
                handle.emit_all("overfloat://GlobalKeyPress", PayloadKeypress { message: format!("{}", key)}).unwrap();
            }));
            
            
            fn callback(event: rdev::Event) {
                match event.event_type {
                  EventType::KeyPress(key) => println!("RDEV Keypress: {:?}\t{:?}", key, event.time),
                  _ => (),
              }
            }
          

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
            "central" => {
                app.emit_all("overfloat://CreateWindow", PayloadCreateWindow { title: "Central".to_string(), id: "central".to_string(), path: "central".to_string()}).unwrap();
            }
            _ => {}
            }
        }
        _ => {}
        })
        .invoke_handler(tauri::generate_handler![send_a])
        .device_event_filter(tauri::DeviceEventFilter::Never)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
}
