/*****************************************************************************
 * @FilePath              : src-tauri/src/keybinds.rs                        *
 * @Author                : Jakub Šediba <xsedib00@vutbr.cz>                 *
 * @Year                  : 2024                                             *
 ****************************************************************************/

use rdev;
use std::collections::HashMap;
use tauri::Manager;

/**
 * @brief Function to convert rdev::Key to string
 * @param key - rdev::Key to convert
 * @return String
 */
fn key_to_string(key: rdev::Key) -> String {
    match key {
        rdev::Key::Alt => String::from("Alt"),
        rdev::Key::AltGr => String::from("AltGr"),
        rdev::Key::Backspace => String::from("Backspace"),
        rdev::Key::CapsLock => String::from("CapsLock"),
        rdev::Key::ControlLeft => String::from("LCtrl"),
        rdev::Key::ControlRight => String::from("RCtrl"),
        rdev::Key::Delete => String::from("Del"),
        rdev::Key::DownArrow => String::from("DownArrow"),
        rdev::Key::End => String::from("End"),
        rdev::Key::Escape => String::from("Escape"),
        rdev::Key::F1 => String::from("F1"),
        rdev::Key::F10 => String::from("F10"),
        rdev::Key::F11 => String::from("F11"),
        rdev::Key::F12 => String::from("F12"),
        rdev::Key::F2 => String::from("F2"),
        rdev::Key::F3 => String::from("F3"),
        rdev::Key::F4 => String::from("F4"),
        rdev::Key::F5 => String::from("F5"),
        rdev::Key::F6 => String::from("F6"),
        rdev::Key::F7 => String::from("F7"),
        rdev::Key::F8 => String::from("F8"),
        rdev::Key::F9 => String::from("F9"),
        rdev::Key::Home => String::from("Home"),
        rdev::Key::LeftArrow => String::from("LeftArrow"),
        rdev::Key::MetaLeft => String::from("LMeta"),
        rdev::Key::MetaRight => String::from("RMeta"),
        rdev::Key::PageDown => String::from("PgDown"),
        rdev::Key::PageUp => String::from("PgUp"),
        rdev::Key::Return => String::from("Return"),
        rdev::Key::RightArrow => String::from("RightArrow"),
        rdev::Key::ShiftLeft => String::from("LShft"),
        rdev::Key::ShiftRight => String::from("RShft"),
        rdev::Key::Space => String::from("Space"),
        rdev::Key::Tab => String::from("Tab"),
        rdev::Key::UpArrow => String::from("UpArrow"),
        rdev::Key::PrintScreen => String::from("PrintScreen"),
        rdev::Key::ScrollLock => String::from("ScrollLock"),
        rdev::Key::Pause => String::from("Pause"),
        rdev::Key::NumLock => String::from("NumLock"),
        rdev::Key::BackQuote => String::from("`"),
        rdev::Key::Num1 => String::from("1"),
        rdev::Key::Num2 => String::from("2"),
        rdev::Key::Num3 => String::from("3"),
        rdev::Key::Num4 => String::from("4"),
        rdev::Key::Num5 => String::from("5"),
        rdev::Key::Num6 => String::from("6"),
        rdev::Key::Num7 => String::from("7"),
        rdev::Key::Num8 => String::from("8"),
        rdev::Key::Num9 => String::from("9"),
        rdev::Key::Num0 => String::from("0"),
        rdev::Key::Minus => String::from("-"),
        rdev::Key::Equal => String::from("="),
        rdev::Key::KeyQ => String::from("Q"),
        rdev::Key::KeyW => String::from("W"),
        rdev::Key::KeyE => String::from("E"),
        rdev::Key::KeyR => String::from("R"),
        rdev::Key::KeyT => String::from("T"),
        rdev::Key::KeyY => String::from("Y"),
        rdev::Key::KeyU => String::from("U"),
        rdev::Key::KeyI => String::from("I"),
        rdev::Key::KeyO => String::from("O"),
        rdev::Key::KeyP => String::from("P"),
        rdev::Key::LeftBracket => String::from("("),
        rdev::Key::RightBracket => String::from(")"),
        rdev::Key::KeyA => String::from("A"),
        rdev::Key::KeyS => String::from("S"),
        rdev::Key::KeyD => String::from("D"),
        rdev::Key::KeyF => String::from("F"),
        rdev::Key::KeyG => String::from("G"),
        rdev::Key::KeyH => String::from("H"),
        rdev::Key::KeyJ => String::from("J"),
        rdev::Key::KeyK => String::from("K"),
        rdev::Key::KeyL => String::from("L"),
        rdev::Key::SemiColon => String::from(";"),
        rdev::Key::Quote => String::from("\""),
        rdev::Key::BackSlash => String::from("\\"),
        rdev::Key::IntlBackslash => String::from("\\"),
        rdev::Key::KeyZ => String::from("Z"),
        rdev::Key::KeyX => String::from("X"),
        rdev::Key::KeyC => String::from("C"),
        rdev::Key::KeyV => String::from("V"),
        rdev::Key::KeyB => String::from("B"),
        rdev::Key::KeyN => String::from("N"),
        rdev::Key::KeyM => String::from("M"),
        rdev::Key::Comma => String::from(","),
        rdev::Key::Dot => String::from("."),
        rdev::Key::Slash => String::from("/"),
        rdev::Key::Insert => String::from("Insert"),
        rdev::Key::KpReturn => String::from("KpReturn"),
        rdev::Key::KpMinus => String::from("KpMinus"),
        rdev::Key::KpPlus => String::from("KpPlus"),
        rdev::Key::KpMultiply => String::from("KpMultiply"),
        rdev::Key::KpDivide => String::from("KpDivide"),
        rdev::Key::Kp0 => String::from("Kp0"),
        rdev::Key::Kp1 => String::from("Kp1"),
        rdev::Key::Kp2 => String::from("Kp2"),
        rdev::Key::Kp3 => String::from("Kp3"),
        rdev::Key::Kp4 => String::from("Kp4"),
        rdev::Key::Kp5 => String::from("Kp5"),
        rdev::Key::Kp6 => String::from("Kp6"),
        rdev::Key::Kp7 => String::from("Kp7"),
        rdev::Key::Kp8 => String::from("Kp8"),
        rdev::Key::Kp9 => String::from("Kp9"),
        rdev::Key::KpDelete => String::from("KpDelete"),
        rdev::Key::Function => String::from("Function"),
        _ => String::from("Unknown"),
    }
}

// List of modifier keys
const RDEV_MODIFIER_KEYS: [rdev::Key; 8] = [
    rdev::Key::MetaLeft,
    rdev::Key::MetaRight,
    rdev::Key::ControlLeft,
    rdev::Key::ControlRight,
    rdev::Key::Alt,
    rdev::Key::AltGr,
    rdev::Key::ShiftLeft,
    rdev::Key::ShiftRight,
];

// Struct for keypress payload
#[derive(Clone, serde::Serialize)]
struct PayloadKeypress {
    key: String,
}

// Struct for keyboard state representation
pub struct KeyboardState {
    pressed_keys: HashMap<rdev::Key, bool>,
}

// Implementation of KeyboardState
impl KeyboardState {
    pub fn new() -> KeyboardState {
        KeyboardState {
            pressed_keys: HashMap::new(),
        }
    }

    /**
     * @brief Function to handle key down event
     * @param handle - tauri::AppHandle
     * @param key - rdev::Key
     */
    fn keydown(&mut self, handle: tauri::AppHandle, key: rdev::Key) {
        // Check if key is already pressed
        let pressed_keys = &mut self.pressed_keys;
        let pressed = pressed_keys.entry(key).or_insert(false);

        // If key is not pressed
        if !*pressed {
            // Set key as pressed
            *pressed = true;

            // If key is not modifier key
            if !RDEV_MODIFIER_KEYS.contains(&key) {
                // If the key is unknown, return
                match key {
                    rdev::Key::Unknown(_) => return,
                    _ => {}
                }

                // Create string to hold resulting key combination
                let mut result_string: String = String::new();

                // Iterate over all modifier keys
                for modifier_key in RDEV_MODIFIER_KEYS {
                    match pressed_keys.get(&modifier_key) {
                        // If modifier key is pressed, add it to the resulting string
                        Some(modifier_pressed) => {
                            if *modifier_pressed {
                                result_string =
                                    format!("{}{}+", result_string, key_to_string(modifier_key));
                            }
                        }
                        None => {}
                    }
                }

                // Add pressed key to the resulting string
                result_string = format!("{}{}", result_string, key_to_string(key));
                
                // Emit a KeyPress event to the Overfloat window
                handle
                    .emit_to(
                        "Overfloat",
                        "Overfloat://GlobalKeypress",
                        PayloadKeypress { key: result_string },
                    )
                    .unwrap();
            }
        }
    }

    /**
     * @brief Function to handle key up event
     * @param _handle - tauri::AppHandle
     * @param key - rdev::Key
     */
    fn keyup(&mut self, _handle: tauri::AppHandle, key: rdev::Key) {
        // Check if key is pressed
        let pressed = self.pressed_keys.entry(key).or_insert(true);

        // If key is pressed set it as not pressed
        if *pressed {
            *pressed = false;
        }
    }

    /**
     * @brief Function to handle key press event
     * @param handle - tauri::AppHandle
     * @param event - rdev::Event
     */
    pub fn handle_key_press_event(&mut self, handle: tauri::AppHandle, event: rdev::Event) {
        match event.event_type {
            rdev::EventType::KeyPress(key) => self.keydown(handle, key),
            rdev::EventType::KeyRelease(key) => self.keyup(handle, key),
            _ => {}
        }
    }
}
