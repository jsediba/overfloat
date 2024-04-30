/*****************************************************************************
 * @FilePath    : src/Api/ShortcutManager.ts                                 *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { WebviewWindow, appWindow } from "@tauri-apps/api/window";
import { UnlistenFn, once, listen } from "@tauri-apps/api/event";

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
     * @param defaultKeybinds Default keybinds for the shortcut
     * @returns True if the shortcut was added successfully, false otherwise
     */
    public addShortcut(
        id: string,
        name: string,
        description: string,
        callback: () => void,
        defaultKeybinds?: string[]
    ): boolean {
        const shortcut_id: string = _SHORTCUT_PREFIX + id;

        if (this.listeners.has(shortcut_id)) {
            return false;
        }

        // Emit the event to add the shortcut
        mainWindow()?.emit("Overfloat://AddShortcut", {
            windowLabel: appWindow.label,
            id: shortcut_id,
            name: name,
            description: description,
            defaultKeybinds: defaultKeybinds,
        });

        // Listen for the shortcut event
        const unlisten = listen(
            "Overfloat://Shortcut/" + shortcut_id,
            (event) => {
                console.log(event);
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
            console.log("Removing shortcut: " + shortcut_id);
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
