// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

use mki::{Action};
use tauri::{self, Manager};

#[tauri::command]
async fn setup_keybinds(app_handle: tauri::AppHandle) {
    app_handle.emit_all("TestEvent", Payload { message: "Testing events".to_string() }).unwrap();
}

fn main() {


    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();
            mki::bind_any_key(Action::handle_kb(move |key| handle.emit_all("overfloat://GlobalKeyPress", Payload{ message: format!("{}", key)}).unwrap()));
            //mki::register_hotkey(&[Keyboard::LeftShift, Keyboard::B], move || {handle.emit_all("TestEvent", Payload{ message: format!("Event from MKI:")}).unwrap()});
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![setup_keybinds])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
    //setup_keybinds();
}
