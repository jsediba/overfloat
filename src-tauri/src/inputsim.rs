use rdev;
use std::time::Duration;
use std::{thread, time};

fn string_to_key(key: &str) -> Result<rdev::Key, &str> {
    match key {
        "Alt" => Ok(rdev::Key::Alt),
        "AltGr" => Ok(rdev::Key::AltGr),
        "Backspace" => Ok(rdev::Key::Backspace),
        "CapsLock" => Ok(rdev::Key::CapsLock),
        "ControlLeft" => Ok(rdev::Key::ControlLeft),
        "ControlRight" => Ok(rdev::Key::ControlRight),
        "Delete" => Ok(rdev::Key::Delete),
        "DownArrow" => Ok(rdev::Key::DownArrow),
        "End" => Ok(rdev::Key::End),
        "Escape" => Ok(rdev::Key::Escape),
        "F1" => Ok(rdev::Key::F1),
        "F10" => Ok(rdev::Key::F10),
        "F11" => Ok(rdev::Key::F11),
        "F12" => Ok(rdev::Key::F12),
        "F2" => Ok(rdev::Key::F2),
        "F3" => Ok(rdev::Key::F3),
        "F4" => Ok(rdev::Key::F4),
        "F5" => Ok(rdev::Key::F5),
        "F6" => Ok(rdev::Key::F6),
        "F7" => Ok(rdev::Key::F7),
        "F8" => Ok(rdev::Key::F8),
        "F9" => Ok(rdev::Key::F9),
        "Home" => Ok(rdev::Key::Home),
        "LeftArrow" => Ok(rdev::Key::LeftArrow),
        "MetaLeft" => Ok(rdev::Key::MetaLeft),
        "MetaRight" => Ok(rdev::Key::MetaRight),
        "PageDown" => Ok(rdev::Key::PageDown),
        "PageUp" => Ok(rdev::Key::PageUp),
        "Return" => Ok(rdev::Key::Return),
        "RightArrow" => Ok(rdev::Key::RightArrow),
        "ShiftLeft" => Ok(rdev::Key::ShiftLeft),
        "ShiftRight" => Ok(rdev::Key::ShiftRight),
        "Space" => Ok(rdev::Key::Space),
        "Tab" => Ok(rdev::Key::Tab),
        "UpArrow" => Ok(rdev::Key::UpArrow),
        "PrintScreen" => Ok(rdev::Key::PrintScreen),
        "ScrollLock" => Ok(rdev::Key::ScrollLock),
        "Pause" => Ok(rdev::Key::Pause),
        "NumLock" => Ok(rdev::Key::NumLock),
        "BackQuote" => Ok(rdev::Key::BackQuote),
        "Num1" => Ok(rdev::Key::Num1),
        "Num2" => Ok(rdev::Key::Num2),
        "Num3" => Ok(rdev::Key::Num3),
        "Num4" => Ok(rdev::Key::Num4),
        "Num5" => Ok(rdev::Key::Num5),
        "Num6" => Ok(rdev::Key::Num6),
        "Num7" => Ok(rdev::Key::Num7),
        "Num8" => Ok(rdev::Key::Num8),
        "Num9" => Ok(rdev::Key::Num9),
        "Num0" => Ok(rdev::Key::Num0),
        "Minus" => Ok(rdev::Key::Minus),
        "Equal" => Ok(rdev::Key::Equal),
        "Q" => Ok(rdev::Key::KeyQ),
        "W" => Ok(rdev::Key::KeyW),
        "E" => Ok(rdev::Key::KeyE),
        "R" => Ok(rdev::Key::KeyR),
        "T" => Ok(rdev::Key::KeyT),
        "Y" => Ok(rdev::Key::KeyY),
        "U" => Ok(rdev::Key::KeyU),
        "I" => Ok(rdev::Key::KeyI),
        "O" => Ok(rdev::Key::KeyO),
        "P" => Ok(rdev::Key::KeyP),
        "LeftBracket" => Ok(rdev::Key::LeftBracket),
        "RightBracket" => Ok(rdev::Key::RightBracket),
        "A" => Ok(rdev::Key::KeyA),
        "S" => Ok(rdev::Key::KeyS),
        "D" => Ok(rdev::Key::KeyD),
        "F" => Ok(rdev::Key::KeyF),
        "G" => Ok(rdev::Key::KeyG),
        "H" => Ok(rdev::Key::KeyH),
        "J" => Ok(rdev::Key::KeyJ),
        "K" => Ok(rdev::Key::KeyK),
        "L" => Ok(rdev::Key::KeyL),
        "SemiColon" => Ok(rdev::Key::SemiColon),
        "Quote" => Ok(rdev::Key::Quote),
        "BackSlash" => Ok(rdev::Key::BackSlash),
        "IntlBackslash" => Ok(rdev::Key::IntlBackslash),
        "Z" => Ok(rdev::Key::KeyZ),
        "X" => Ok(rdev::Key::KeyX),
        "C" => Ok(rdev::Key::KeyC),
        "V" => Ok(rdev::Key::KeyV),
        "B" => Ok(rdev::Key::KeyB),
        "N" => Ok(rdev::Key::KeyN),
        "M" => Ok(rdev::Key::KeyM),
        "Comma" => Ok(rdev::Key::Comma),
        "Dot" => Ok(rdev::Key::Dot),
        "Slash" => Ok(rdev::Key::Slash),
        "Insert" => Ok(rdev::Key::Insert),
        "KpReturn" => Ok(rdev::Key::KpReturn),
        "KpMinus" => Ok(rdev::Key::KpMinus),
        "KpPlus" => Ok(rdev::Key::KpPlus),
        "KpMultiply" => Ok(rdev::Key::KpMultiply),
        "KpDivide" => Ok(rdev::Key::KpDivide),
        "Kp0" => Ok(rdev::Key::Kp0),
        "Kp1" => Ok(rdev::Key::Kp1),
        "Kp2" => Ok(rdev::Key::Kp2),
        "Kp3" => Ok(rdev::Key::Kp3),
        "Kp4" => Ok(rdev::Key::Kp4),
        "Kp5" => Ok(rdev::Key::Kp5),
        "Kp6" => Ok(rdev::Key::Kp6),
        "Kp7" => Ok(rdev::Key::Kp7),
        "Kp8" => Ok(rdev::Key::Kp8),
        "Kp9" => Ok(rdev::Key::Kp9),
        "KpDelete" => Ok(rdev::Key::KpDelete),
        "Function" => Ok(rdev::Key::Function),
        _ => Err("Unknown Key"),
    }
}

#[derive(Debug, serde::Deserialize)]
pub struct SimulationStep {
    device_type: i64,
    simulation_type: i64,
    data_str: String,
    data_num1: f64,
    data_num2: f64,
}

pub fn simulate_inputs(inputs: Vec<SimulationStep>) {
    for step in inputs {
        match step.device_type{
            0=>thread::sleep(Duration::from_millis(step.data_num1 as u64)),
            1=>{
                match step.simulation_type{
                    0..=2 => keyboard_key(step.simulation_type, step.data_str),
                    3 =>  keyboard_text(step.data_str),
                    _ => {}
                }
            }
            2=>{
                match step.simulation_type{
                    0 => mouse_move(step.data_num1, step.data_num2),
                    1..=2 => mouse_button(step.simulation_type, step.data_num1 as i64),
                    3 => mouse_scroll(step.data_num1 as i64, step.data_num2 as i64),
                    _ => {}
                }
            }
            _ => {}
        }
    }
}

fn keyboard_key(simulation_type: i64, key_string: String) {
    let key: rdev::Key = match string_to_key(key_string.as_str()){
        Ok(key)=> key,
        Err(_) => return
    };

    match simulation_type {
        0 => send_event(&rdev::EventType::KeyPress(key)),
        1 => send_event(&rdev::EventType::KeyRelease(key)),
        2 => {
            send_event(&rdev::EventType::KeyPress(key));
            send_event(&rdev::EventType::KeyRelease(key));
        },
        _ => return,
    }
}

fn keyboard_text(text: String){
    println!("Simulate text: {}", text);
}

fn send_event(event_type: &rdev::EventType) {
    let delay = time::Duration::from_millis(1);
    match rdev::simulate(event_type) {
        Ok(()) => (),
        Err(_) => {
            println!("Failed to send event: {:?}", event_type);
        }
    }
    thread::sleep(delay);
}

fn mouse_button(simulation_type: i64, button: i64) {
    let mouse_button: rdev::Button = match button {
        0 => rdev::Button::Left,
        1 => rdev::Button::Middle,
        2 => rdev::Button::Right,
        _ => return,
    };

    match simulation_type {
        0 => send_event(&rdev::EventType::ButtonPress(mouse_button)),
        1 => send_event(&rdev::EventType::ButtonRelease(mouse_button)),
        2 => {
            send_event(&rdev::EventType::ButtonPress(mouse_button));
            send_event(&rdev::EventType::ButtonRelease(mouse_button));
        }
        _ => return,
    }
}

fn mouse_scroll(delta_x: i64, delta_y: i64) {
    println!("Mouse Move: {}, {}", delta_x, delta_y);

    send_event(&rdev::EventType::Wheel {
        delta_x: delta_x,
        delta_y: delta_y,
    });
}

fn mouse_move(x: f64, y: f64) {
    send_event(&rdev::EventType::MouseMove { x: x, y: y });
}
