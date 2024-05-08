/*****************************************************************************
 * @FilePath    : src/api/ShortcutManager.ts                                 *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { WebviewWindow, appWindow } from "@tauri-apps/api/window";
import { UnlistenFn, once, listen } from "@tauri-apps/api/event";

// Enum for modifier keys
export enum ModifierKey {
    LeftMeta = "LMeta",
    RightMeta = "RMeta",
    LeftControl = "LCtrl",
    RightControl = "RCtrl",
    Alt = "Alt",
    AltGr = "AltGr",
    LeftShift = "LShft",
    RightShift = "RShft",
}

// Enum for keys
export enum Key {
    BackQuote = "`",
    Num1 = "1",
    Num2 = "2",
    Num3 = "3",
    Num4 = "4",
    Num5 = "5",
    Num6 = "6",
    Num7 = "7",
    Num8 = "8",
    Num9 = "9",
    Num0 = "0",
    Minus = "-",
    Equal = "=",

    F1 = "F1",
    F2 = "F2",
    F3 = "F3",
    F4 = "F4",
    F5 = "F5",
    F6 = "F6",
    F7 = "F7",
    F8 = "F8",
    F9 = "F9",
    F10 = "F10",
    F11 = "F11",
    F12 = "F12",

    Q = "Q",
    W = "W",
    E = "E",
    R = "R",
    T = "T",
    Y = "Y",
    U = "U",
    I = "I",
    O = "O",
    P = "P",
    A = "A",
    S = "S",
    D = "D",
    F = "F",
    G = "G",
    H = "H",
    J = "J",
    K = "K",
    L = "L",
    Z = "Z",
    X = "X",
    C = "C",
    V = "V",
    B = "B",
    N = "N",
    M = "M",

    KeyPadReturn = "KpReturn",
    KeyPadMinus = "KpMinus",
    KeyPadPlus = "KpPlus",
    KeyPadMultiply = "KpMultiply",
    KeyPadDivide = "KpDivide",
    KeyPadDelete = "KpDelete",
    KeyPad0 = "Kp0",
    KeyPad1 = "Kp1",
    KeyPad2 = "Kp2",
    KeyPad3 = "Kp3",
    KeyPad4 = "Kp4",
    KeyPad5 = "Kp5",
    KeyPad6 = "Kp6",
    KeyPad7 = "Kp7",
    KeyPad8 = "Kp8",
    KeyPad9 = "Kp9",

    UpArrow = "UpArrow",
    DownArrow = "DownArrow",
    LeftArrow = "LeftArrow",
    RightArrow = "RightArrow",

    Insert = "Insert",
    Home = "Home",
    Delete = "Delete",
    End = "End",
    PageUp = "PgUp",
    PageDown = "PgDown",
    Escape = "Escape",
    Return = "Return",
    Space = "Space",
    Tab = "Tab",
    PrintScreen = "PrintScreen",
    Pause = "Pause",
    Function = "Function",
    ScrollLock = "ScrollLock",
    NumLock = "NumLock",
    CapsLock = "CapsLock",
    Backspace = "Backspace",
    LeftBracket = "(",
    RightBracket = ")",
    Semicolon = ";",
    Quote = '"',
    Backslash = "\\",
    Comma = ",",
    Period = ".",
    Slash = "/",
}

// Type for a key combination
export type KeyCombination = {
    key: Key;
    modifiers?: ModifierKey[];
};

/**
 * Transforms a KeyCombination object to a string
 * @param keyCombination The KeyCombination object to be transformed
 * @returns String representation of the KeyCombination
 */
function KeyCombinationToString(keyCombination: KeyCombination): string {
    if (keyCombination.modifiers === undefined) {
        return keyCombination.key;
    }

    let resultString: string = "";

    // Add the modifiers in order of priority
    if (keyCombination.modifiers.includes(ModifierKey.LeftMeta)) {
        resultString += "LMeta+";
    }
    if (keyCombination.modifiers.includes(ModifierKey.RightMeta)) {
        resultString += "RMeta+";
    }
    if (keyCombination.modifiers.includes(ModifierKey.LeftControl)) {
        resultString += "LCtrl+";
    }
    if (keyCombination.modifiers.includes(ModifierKey.RightControl)) {
        resultString += "RCtrl+";
    }
    if (keyCombination.modifiers.includes(ModifierKey.Alt)) {
        resultString += "Alt+";
    }
    if (keyCombination.modifiers.includes(ModifierKey.AltGr)) {
        resultString += "AltGr+";
    }
    if (keyCombination.modifiers.includes(ModifierKey.LeftShift)) {
        resultString += "LShft+";
    }
    if (keyCombination.modifiers.includes(ModifierKey.RightShift)) {
        resultString += "RShft+";
    }

    resultString += keyCombination.key;
    return resultString;
}

/**
 * @brief Function for getting the main window of the application
 * @returns WebviewWindow object representing the main window
 */
function mainWindow() {
    return WebviewWindow.getByLabel("Overfloat");
}

// Prefix for the shortcuts of the current window
const _SHORTCUT_PREFIX: string = appWindow.label + "/";

/**
 * @brief Singleton class for handling shortcut related events
 * @details A separate instance of this class is created for each window.
 */
class _ShortcutManager {
    private static instance: _ShortcutManager;
    private listeners: Map<string, Promise<UnlistenFn>>;

    private constructor() {
        this.listeners = new Map<string, Promise<UnlistenFn>>();

        // When the window is closed, remove all shortcuts
        once("Overfloat://Close", () => {
            this.listeners.forEach((listener) => listener.then((f) => f()));
            appWindow.close();
        });
    }

    public static getInstance(): _ShortcutManager {
        if (!_ShortcutManager.instance) {
            _ShortcutManager.instance = new _ShortcutManager();
        }

        return _ShortcutManager.instance;
    }

    /**
     * @brief Add a new shortcut
     * @param id ID of the shortcut
     * @param name Name of the shortcut
     * @param description Description of the shortcut
     * @param callback Callback function to be called when the shortcut is triggered
     * @param defaultKeybinds Default key combinations bound to the shortcut
     * @returns True if the shortcut was added successfully, false otherwise
     */
    public addShortcut(
        id: string,
        name: string,
        description: string,
        callback: () => void,
        defaultKeybinds?: KeyCombination[]
    ): boolean {
        const shortcut_id: string = _SHORTCUT_PREFIX + id;

        if (this.listeners.has(shortcut_id)) {
            return false;
        }

        let keybinds: string[] | undefined = defaultKeybinds?.map(
            (keyCombination) => {
                return KeyCombinationToString(keyCombination);
            }
        );

        // Emit the event to add the shortcut
        mainWindow()?.emit("Overfloat://AddShortcut", {
            windowLabel: appWindow.label,
            id: shortcut_id,
            name: name,
            description: description,
            defaultKeybinds: keybinds,
        });

        // Listen for the shortcut event
        const unlisten = listen(
            "Overfloat://Shortcut/" + shortcut_id,
            () => {
                callback();
            }
        );
        this.listeners.set(shortcut_id, unlisten);

        return true;
    }

    /**
     * @brief Remove a shortcut
     * @param id ID of the shortcut to be removed
     */
    public removeShortcut(id: string) {
        const shortcut_id: string = _SHORTCUT_PREFIX + id;
        mainWindow()?.emit("Overfloat://RemoveShortcut", {
            id: shortcut_id,
        });

        const listener = this.listeners.get(shortcut_id);
        this.listeners.delete(shortcut_id);

        listener?.then((f) => {
            f();
        });
    }

    /**
     * @brief Remove all shortcuts of the current window
     */
    public removeAllShortcuts() {
        const listeners = new Map<string, Promise<UnlistenFn>>(this.listeners);

        listeners.forEach((_, shortcut_id) => {
            this.removeShortcut(shortcut_id.substring(_SHORTCUT_PREFIX.length));
        });
    }
}

// Export the singleton instance of the ShortcutManager
export const ShortcutManager = Object.freeze(_ShortcutManager.getInstance());
