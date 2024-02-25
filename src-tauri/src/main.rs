// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


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

use mki::{Action};
use tauri::{self, Manager, CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let central = CustomMenuItem::new("central".to_string(), "Central");
    let tray_menu = SystemTrayMenu::new().add_item(central).add_item(quit); // insert the menu items here
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            mki::bind_any_key(Action::handle_kb(move |key| handle.emit_all("overfloat://GlobalKeyPress", PayloadKeypress { message: format!("{}", key)}).unwrap()));
            //mki::register_hotkey(&[Keyboard::LeftShift, Keyboard::B], move || {handle.emit_all("TestEvent", Payload{ message: format!("Event from MKI:")}).unwrap()});
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
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
    //setup_keybinds();
}
