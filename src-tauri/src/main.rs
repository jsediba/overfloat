// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rdev;
use std::{
    fs,
    io::{Seek, SeekFrom, Write},
    path, string,
};
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    SystemTrayMenuItemHandle,
};

mod fswatch;
mod inputsim;
mod keybinds;

#[derive(Clone, serde::Serialize)]
struct FSResult {
    successful: bool,
    path: String,
    message: String,
}

#[tauri::command]
fn read_file(path_str: String, use_relative_path: bool, module_name: String) -> FSResult {
    let final_path_str: String;
    if use_relative_path {
        final_path_str = format!("../overfloat_modules/{}/{}", module_name, path_str);
    } else {
        final_path_str = path_str;
    }

    let path = std::path::Path::new(&final_path_str);
    let message: String;
    let successful: bool;

    match fs::read_to_string(path) {
        Ok(content) => {
            successful = true;
            message = content;
        }
        Err(error) => {
            successful = false;
            message = error.to_string();
        }
    }

    return FSResult {
        successful: successful,
        path: final_path_str,
        message: message,
    };
}

#[tauri::command]
fn write_file(
    content: String,
    path_str: String,
    append_mode: bool,
    use_relative_path: bool,
    module_name: String,
) -> FSResult {
    let final_path_str: String;
    if use_relative_path {
        final_path_str = format!("../overfloat_modules/{}/{}", module_name, path_str);
    } else {
        final_path_str = path_str;
    }

    let path = std::path::Path::new(&final_path_str);

    if let Some(parent) = path.parent() {
        if let Err(error) = std::fs::create_dir_all(parent) {
            return FSResult {
                successful: false,
                path: final_path_str,
                message: error.to_string(),
            };
        }
    }

    let message: String;
    let successful: bool;

    match fs::OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(!append_mode)
        .open(&final_path_str)
    {
        Ok(mut file) => {
            let _ = file.seek(SeekFrom::End(0));
            match file.write_all(content.as_bytes()) {
                Ok(_) => {
                    message = String::new();
                    successful = true;
                }
                Err(error) => {
                    message = error.to_string();
                    successful = false;
                }
            }
        }
        Err(error) => {
            message = error.to_string();
            successful = false;
        }
    };

    return FSResult {
        successful: successful,
        path: final_path_str,
        message: message,
    };
}

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
fn hide_app(handle: tauri::AppHandle) {
    let tray_item_handle: SystemTrayMenuItemHandle = handle.tray_handle().get_item("Overfloat");
    let _ = tray_item_handle.set_title("Overfloat");
    match handle.get_window("Overfloat") {
        Some(window) => {
            let _ = window.hide();
        }
        None => {}
    }
}

#[tauri::command]
fn quit_app(handle: tauri::AppHandle) {
    handle.exit(0);
}

#[tauri::command]
fn get_config() -> String {
    let path = std::path::Path::new("../config/config.json");

    match fs::read_to_string(path) {
        Ok(content) => content,
        Err(error) => {
            println!("Couldn't read config file: {}", error);
            String::new()
        }
    }
}

#[tauri::command]
fn save_config(config_json: String) {
    if let Some(parent) = std::path::Path::new("../config/config.json").parent() {
        if let Err(err) = std::fs::create_dir_all(parent) {
            println!("Error while creating directories for config file: {}", err);
        }
    }

    match fs::OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open("../config/config.json")
    {
        Ok(mut file) => match file.write_all(config_json.as_bytes()) {
            Ok(_) => {}
            Err(error) => println!("Error while writing into a config file: {}", error),
        },
        Err(error) => println!("Error while opening a config file{}", error),
    };
}

#[tauri::command]
fn get_profiles() -> String {
    let path = std::path::Path::new("../config/profiles.json");

    match fs::read_to_string(path) {
        Ok(content) => content,
        Err(error) => {
            println!("Couldn't read profile file: {}", error);
            String::new()
        }
    }
}

#[tauri::command]
fn save_profiles(profiles_json: String) {
    if let Some(parent) = std::path::Path::new("../config/profiles.json").parent() {
        if let Err(err) = std::fs::create_dir_all(parent) {
            println!("Error while creating directories for profile file: {}", err);
        }
    }

    match fs::OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open("../config/profiles.json")
    {
        Ok(mut file) => match file.write_all(profiles_json.as_bytes()) {
            Ok(_) => {}
            Err(error) => println!("Error while writing into a profile file: {}", error),
        },
        Err(error) => println!("Error while opening a profile file{}", error),
    };
}

#[tauri::command]
async fn watch_path(handle: tauri::AppHandle, path: String, window_label: String, id: String) {
    let window_label_clone = window_label.clone();
    let id_clone = id.clone();

    fswatch::remove_watched_path(&window_label_clone, &id_clone);

    let process = tauri::async_runtime::spawn(async move {
        if let Err(_) = fswatch::async_watch(handle, path, window_label, id).await {}
    });

    fswatch::add_watched_path(&window_label_clone, &id_clone, process);
}

#[tauri::command]
async fn stop_watching(window_label: String, id: String) {
    fswatch::remove_watched_path(&window_label, &id)
}

#[tauri::command]
fn input_simulation(simulation_steps: Vec<inputsim::SimulationStep>) {
    inputsim::simulate_inputs(simulation_steps);
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
    let module_manager = CustomMenuItem::new("Overfloat".to_string(), "✔ Overfloat");

    let quit = CustomMenuItem::new("Quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(module_manager)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let mut keyboard_state = keybinds::KeyboardState::new();

    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle();

            //Keybind event firing
            /*
            mki::bind_any_key(mki::Action::handle_kb(move |key| {
                println!("MKI Keypress: {:?}", key);
            }));
            */
            //fn callback(event: rdev::Event) {

            let callback = move |event: rdev::Event| match event.event_type {
                rdev::EventType::KeyPress(_) => {
                    keyboard_state.handle_key_press_event(handle.clone(), event)
                }
                rdev::EventType::KeyRelease(_) => {
                    keyboard_state.handle_key_press_event(handle.clone(), event)
                }
                _ => {}
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
                    app.exit(0);
                }
                "Overfloat" => {
                    tray_toggle_window(app.clone(), "Overfloat", "Overfloat", "Overfloat")
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            get_module_names,
            watch_path,
            input_simulation,
            get_profiles,
            save_profiles,
            get_config,
            save_config,
            hide_app,
            quit_app,
            read_file,
            write_file,
            stop_watching,
        ])
        .device_event_filter(tauri::DeviceEventFilter::Always)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
