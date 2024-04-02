// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rdev;
use std::{fs, path, string};
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem
};

mod keybinds;

mod fswatch;

#[tauri::command]
fn get_module_names() -> Vec<string::String> {
    let mut modules = Vec::new();
    for entry in fs::read_dir("../overfloat_modules").unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_dir() {
            let p: path::PathBuf = path
                .iter()
                .skip_while(|s| *s != "overfloat_modules")
                .skip(1)
                .collect();

            modules.push(p.into_os_string().into_string().unwrap());
        }
    }

    modules
}


#[tauri::command]
async fn watch_path(handle: tauri::AppHandle, path: String, window_label: String, id: String) {
    tauri::async_runtime::spawn(async move {
        if let Err(e) = fswatch::async_watch(handle, path, window_label, id).await {
            println!("error: {:?}", e)
        }
    });
}

fn tray_toggle_window(
    handle: tauri::AppHandle,
    window_label: &str,
    tray_item_id: &str,
    tray_item_title: &str,
) {
    match handle.get_window(window_label) {
        Some(window) => match window.is_visible() {
            Ok(visible) => {
                if visible {
                    match window.hide() {
                        Ok(_) => {
                            handle
                                .tray_handle()
                                .get_item(tray_item_id)
                                .set_title(tray_item_title)
                                .unwrap();
                        }
                        Err(_) => {}
                    }
                } else {
                    match window.show() {
                        Ok(_) => {
                            handle
                                .tray_handle()
                                .get_item(tray_item_id)
                                .set_title(format!("{}{}", "✔ ", tray_item_title))
                                .unwrap();
                        }
                        Err(_) => {}
                    }
                }
            }
            Err(_) => {}
        },
        None => {}
    }
}

fn main() {
    /*
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let central = CustomMenuItem::new("central".to_string(), "Central");
    */
    let _module_names: Vec<string::String> = get_module_names();

    /*
    let tray_menu = SystemTrayMenu::new(); // insert the menu items here
    for module in get_module_names(){
        let m = CustomMenuItem::new(module.clone(), module.clone());
        tray_menu.as_ref().add_item(m);
    }
    */
    let module_manager = CustomMenuItem::new("ModuleManager".to_string(), "✔ Module Manager");
    let keybind_manager = CustomMenuItem::new("KeybindManager".to_string(), "✔ Keybind Manager");

    let quit = CustomMenuItem::new("Quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(module_manager)
        .add_item(keybind_manager)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let mut keyboard_state = keybinds::KeyboardState::new();

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
                //handle_key_press_event(handle.clone(), keyboard_state, event);
                keyboard_state.handle_key_press_event(handle.clone(), event)
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
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "Quit" => {
                    std::process::exit(0);
                }
                "ModuleManager" => tray_toggle_window(
                    app.clone(),
                    "overfloat_modules",
                    "ModuleManager",
                    "Module Manager",
                ),
                "KeybindManager" => tray_toggle_window(
                    app.clone(),
                    "overfloat_keybinds",
                    "KeybindManager",
                    "Keybind Manager",
                ),
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![get_module_names, watch_path])
        .device_event_filter(tauri::DeviceEventFilter::Always)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
