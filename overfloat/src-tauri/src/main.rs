/*****************************************************************************
 * @FilePath              : src-tauri/src/main.rs                            *
 * @Author                : Jakub Šediba <xsedib00@vutbr.cz>                 *
 * @Year                  : 2024                                             *
 ****************************************************************************/

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use rdev;
use std::{
    fs,
    io::{Seek, SeekFrom, Write},
};
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
    SystemTrayMenuItemHandle,
};

mod fswatch;
mod inputsim;
mod keybinds;

// Struct for returning results from file system operations
#[derive(Clone, serde::Serialize)]
struct FSResult {
    successful: bool,
    path: String,
    message: String,
}

/**
 * @brief Reads a file from the file system
 * @param path_str: Path to the file
 * @param use_relative_path: If true, the path is relative to instalation_directory/overfloat_modules/module_name/ 
 * @param module_name: Name of the module
 * @return FSResult: Struct containing the result of the operation
 */
#[tauri::command]
fn read_file(path_str: String, use_relative_path: bool, module_name: String) -> FSResult {
    // Construct the path string based on the parameters
    let final_path_str: String;

    if use_relative_path {
        final_path_str = format!("{}/overfloat_modules/{}/{}", get_install_dir(), module_name, path_str);
    } else {
        final_path_str = path_str;
    }

    // Create a path object
    let path = std::path::Path::new(&final_path_str);

    // Prepare the result variables
    let message: String;
    let successful: bool;

    // Try to read the file and handle the result
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

    // Return the result
    return FSResult {
        successful: successful,
        path: final_path_str,
        message: message,
    };
}

/**
 * @brief Writes a file to the file system
 * @param content: Content to write
 * @param path_str: Path to the file
 * @param append_mode: If true, the content is appended to the file without truncating it
 * @param use_relative_path: If true, the path is relative to instalation_directory/overfloat_modules/module_name/ 
 * @param module_name: Name of the module
 * @return FSResult: Struct containing the result of the operation
 */
#[tauri::command]
fn write_file(
    content: String,
    path_str: String,
    append_mode: bool,
    use_relative_path: bool,
    module_name: String,
) -> FSResult {
    // Construct the path string based on the parameters
    let final_path_str: String;
    if use_relative_path {
        final_path_str = format!("{}/overfloat_modules/{}/{}", get_install_dir(), module_name, path_str);
    } else {
        final_path_str = path_str;
    }

    // Create a path object
    let path = std::path::Path::new(&final_path_str);


    // Create parent directories if they don't exist
    if let Some(parent) = path.parent() {
        if let Err(error) = std::fs::create_dir_all(parent) {
            // Return an error if the directories couldn't be created
            return FSResult {
                successful: false,
                path: final_path_str,
                message: error.to_string(),
            };
        }
    }

    // Prepare the result variables
    let message: String;
    let successful: bool;

    // Try to write the file and handle the result
    match fs::OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(!append_mode)
        .open(&final_path_str)
    {
        Ok(mut file) => {
            // Move the cursor to the end of the file
            let _ = file.seek(SeekFrom::End(0));

            // Write the content to the file and handle the result
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

    // Return the result
    return FSResult {
        successful: successful,
        path: final_path_str,
        message: message,
    };
}

/**
 * @brief Toggles the visibility of the Overfloat window
 * @param handle: Tauri application handle
 */
#[tauri::command]
fn hide_app(handle: tauri::AppHandle) {
    // Get the handle of the Overfloat tray item and remove the "✔" from the title
    let tray_item_handle: SystemTrayMenuItemHandle = handle.tray_handle().get_item("Overfloat");
    let _ = tray_item_handle.set_title("Overfloat");

    // Hide the Overfloat window
    match handle.get_window("Overfloat") {
        Some(window) => {
            let _ = window.hide();
        }
        None => {}
    }
}

/**
 * @brief Quits the application
 */
#[tauri::command]
fn quit_app(handle: tauri::AppHandle) {
    handle.exit(0);
}

/**
 * @brief Gets the content of the config file
 * @return String: Content of the config file
 */
#[tauri::command]
fn get_config() -> String {
    
    let path_string: String;
    let mode = std::env::var("TAURI_MODE").unwrap_or_else(|_| "unknown".to_string());
    
    // Use the config file from the development directory if the application is running in development mode
    if mode == "development"{
        path_string = format!("../config/config.json");
    } 
    // Use the config file from the installation directory otherwise
    else {
        path_string = format!("{}/config/config.json", get_install_dir());
    }
    
    // Create a path object
    let path = std::path::Path::new(&path_string);

    // Try to read the file and handle the result
    match fs::read_to_string(path) {
        Ok(content) => content,
        Err(err) => {
            println!("Error while reading the config file: {}", err);
            String::new()},
    }
}

/**
 * @brief Saves the content to the config file
 * @param config_json: Content to save
 * @return String: Content of the config file
 */
#[tauri::command]
fn save_config(config_json: String) {

    let path_string: String;
    let mode = std::env::var("TAURI_MODE").unwrap_or_else(|_| "unknown".to_string());
    
    // Use the config file from the development directory if the application is running in development mode
    if mode == "development"{
        path_string = format!("../config/config.json");
    } 
    // Use the config file from the installation directory otherwise
    else {
        path_string = format!("{}/config/config.json", get_install_dir());
    }

    // Create parent directories if they don't exist
    if let Some(parent) = std::path::Path::new(&path_string).parent() {
        if let Err(err) = std::fs::create_dir_all(parent) {
            println!("Error while creating directories for config file: {}", err);
        }
    }

    // Try to write the content to the config file and handle the result
    match fs::OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(&path_string)
    {
        Ok(mut file) => match file.write_all(config_json.as_bytes()) {
            Ok(_) => {}
            Err(error) => println!("Error while writing into a config file: {}", error),
        },
        Err(error) => println!("Error while opening a config file{}", error),
    };
}

/**
 * @brief Gets the content of the profiles file
 * @return String: Content of the profiles file
 */
#[tauri::command]
fn get_profiles() -> String {
    
    let path_string: String;
    let mode = std::env::var("TAURI_MODE").unwrap_or_else(|_| "unknown".to_string());

    // Use the profiles file from the development directory if the application is running in development mode
    if mode == "development"{
        path_string = format!("../config/profiles.json");
    } 
    // Use the profiles file from the installation directory otherwise
    else {
        path_string = format!("{}/config/profiles.json", get_install_dir());
    }
    
    // Create a path object
    let path = std::path::Path::new(&path_string);

    // Try to read the file and handle the result
    match fs::read_to_string(path) {
        Ok(content) => content,
        Err(error) => {
            println!("Couldn't read profile file: {}", error);
            String::new()
        }
    }
}

/**
 * @brief Saves the content to the profiles file
 * @param profiles_json: Content to save
 */
#[tauri::command]
fn save_profiles(profiles_json: String) {

    let path_string: String;
    let mode = std::env::var("TAURI_MODE").unwrap_or_else(|_| "unknown".to_string());
    
    // Use the profiles file from the development directory if the application is running in development mode
    if mode == "development"{
        path_string = format!("../config/profiles.json");
    } 
    // Use the profiles file from the installation directory otherwise
    else {
        path_string = format!("{}/config/profiles.json", get_install_dir());
    }
    

    // Create parent directories if they don't exist
    if let Some(parent) = std::path::Path::new(&path_string).parent() {
        if let Err(err) = std::fs::create_dir_all(parent) {
            println!("Error while creating directories for profile file: {}", err);
            return;
        }
    }

    // Try to write the content to the file and handle the result
    match fs::OpenOptions::new()
        .write(true)
        .create(true)
        .truncate(true)
        .open(&path_string)
    {
        Ok(mut file) => match file.write_all(profiles_json.as_bytes()) {
            Ok(_) => {}
            Err(error) => println!("Error while writing into a profile file: {}", error),
        },
        Err(error) => println!("Error while opening a profile file{}", error),
    };
}

/**
 * @brief Watches a path for changes
 * @param handle: Tauri application handle
 * @param path: Path to watch
 * @param window_label: Label of the window to be notified
 * @param id: ID of the watched path
 */
#[tauri::command]
async fn watch_path(handle: tauri::AppHandle, path: String, window_label: String, id: String) {
    // Clone the parameters to be used for tracking the watched path
    let window_label_clone = window_label.clone();
    let id_clone = id.clone();

    // Remove the watched path if it already exists
    fswatch::remove_watched_path(&window_label_clone, &id_clone);

    // Spawn a new async task for watching the path
    let task = tauri::async_runtime::spawn(async move {
        if let Err(_) = fswatch::async_watch(handle, path, window_label, id).await {}
    });

    // Add the watched path to the list of watched paths
    fswatch::add_watched_path(&window_label_clone, &id_clone, task);
}

/**
 * @brief Stops watching a path
 * @param window_label: Label of the window that was being notified
 * @param id: ID of the watched path
 */
#[tauri::command]
async fn stop_watching(window_label: String, id: String) {
    fswatch::remove_watched_path(&window_label, &id)
}

/**
 * @brief Simulates input events
 * @param simulation_steps: Vector of simulation steps
 */
#[tauri::command]
fn input_simulation(simulation_steps: Vec<inputsim::SimulationStep>) {
    inputsim::simulate_inputs(simulation_steps);
}

/**
 * @brief Toggles the visibility of a window and updates the tray item title
 * @param handle: Tauri application handle
 * @param window_label: Label of the window to toggle
 * @param tray_item_id: ID of the tray item to update
 * @param tray_item_title: Title of the tray item to update
 */
fn tray_toggle_window(
    handle: tauri::AppHandle,
    window_label: &str,
    tray_item_id: &str,
    tray_item_title: &str,
) {
    // Get the window by label
    match handle.get_window(window_label) {
        // Check if the window is visible
        Some(window) => match window.is_visible() {
            Ok(visible) => {
                // Toggle the visibility of the window and update the tray item title
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

/**
 * @brief Get the directory of the installed application
 * @return String: Path to the installed directory in as String
 */
fn get_install_dir() -> String{
    let current_exe:std::path::PathBuf = std::env::current_exe().unwrap();
    let current_dir:&std::path::Path = current_exe.parent().unwrap();
    let current_dir_str: String = current_dir.to_str().unwrap().to_string();
    current_dir_str
}

fn main() {
    // Create the tray menu
    let overfloat = CustomMenuItem::new("Overfloat".to_string(), "✔ Overfloat");
    let quit = CustomMenuItem::new("Quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(overfloat)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    // Create a keyboard state object
    let mut keyboard_state = keybinds::KeyboardState::new();

    // Run the Tauri application
    tauri::Builder::default()
        .setup(|app| {
            // Setup callback for keyboard events
            let handle = app.handle();
            let callback = move |event: rdev::Event| match event.event_type {
                rdev::EventType::KeyPress(_) => {
                    keyboard_state.handle_key_press_event(handle.clone(), event)
                }
                rdev::EventType::KeyRelease(_) => {
                    keyboard_state.handle_key_press_event(handle.clone(), event)
                }
                _ => {}
            };

            // Spawn a new async task for listening to rdev keyboard events
            tauri::async_runtime::spawn(async move {
                if let Err(error) = rdev::listen(callback) {
                    println!("Error: {:?}", error)
                }
            });

            Ok(())
        })
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(|app, event| match event {
            // Handle system tray events
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
