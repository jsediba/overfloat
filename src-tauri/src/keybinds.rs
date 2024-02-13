
use mki::Keyboard;

pub fn setup_keybinds() {
    mki::register_hotkey(&[Keyboard::A], || {
        println!("[z] Pressed")
    });

    mki::register_hotkey(&[Keyboard::LeftShift, Keyboard::D], || {
        println!("[X] Pressed")
    });
}