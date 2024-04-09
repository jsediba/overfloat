import { WebviewWindow, appWindow } from "@tauri-apps/api/window";
import { UnlistenFn, listen, once } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api";
import { readText, writeText } from "@tauri-apps/api/clipboard";
import { WindowEventType } from "../utils/WindowEventHandler";
import { NameValuePairs } from "../utils/OverfloatModule";

function mainWindow() {
    return WebviewWindow.getByLabel("Overfloat");
}

export function openMainWindow() {
    showMainWindow();
}

export function showMainWindow() {
    mainWindow()?.emit("Overfloat://MainWindowModification", {
        eventType: WindowEventType.Show,
    });
}

export function hideMainWindow() {
    mainWindow()?.emit("Overfloat://MainWindowModification", {
        eventType: WindowEventType.Hide,
    });
}

export function closeMainWindow() {
    mainWindow()?.emit("Overfloat://MainWindowModification", {
        eventType: WindowEventType.Close,
    });
}

export function openSubwindow(
    componentName: string,
    title?: string,
    parameters?: NameValuePairs
) {
    mainWindow()?.emit("Overfloat://SubwindowOpen", {
        componentName: componentName,
        title: title,
        params: parameters,
    });
}

export function showSubwindow(label: string = appWindow.label) {
    mainWindow()?.emit("Overfloat://SubwindowModification", {
        eventType: WindowEventType.Show,
        label: label,
    });
}

export function getParameter(name: string): string {
    const value = new URLSearchParams(window.location.search).get(name);
    return value == null ? "" : value;
}

export function hideSubwindow(label: string = appWindow.label) {
    mainWindow()?.emit("Overfloat://SubwindowModification", {
        eventType: WindowEventType.Hide,
        label: label,
    });
    console.log("Hiding Subwindow: " + label);
}

export function closeSubwindow(label: string = appWindow.label) {
    mainWindow()?.emit("Overfloat://SubwindowModification", {
        eventType: WindowEventType.Close,
        label: label,
    });

    WebviewWindow.getByLabel(label)?.emit("Overfloat://Close");
}

const _SHORTCUT_PREFIX: string = appWindow.label + "/";

class _ShortcutManager {
    private static instance: _ShortcutManager;
    private listeners: Map<string, Promise<UnlistenFn>>;

    private constructor() {
        console.log("Creating new ShortcutManager");
        this.listeners = new Map<string, Promise<UnlistenFn>>();

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

        mainWindow()?.emit("Overfloat://AddShortcut", {
            windowLabel: appWindow.label,
            id: shortcut_id,
            name: name,
            description: description,
            defaultKeybinds: defaultKeybinds,
        });

        const unlisten = listen(
            "Overfloat://Shortcut/" + shortcut_id,
            (event) => {
                console.log(event);
                callback();
            }
        );

        console.log(
            "Setting unlistener: " + unlisten + " for id: " + shortcut_id
        );

        this.listeners.set(shortcut_id, unlisten);

        return true;
    }

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

    public removeAllShortcuts() {
        this.listeners.forEach((_, shortcut_id) => {
            this.removeShortcut(shortcut_id.substring(_SHORTCUT_PREFIX.length));
        });
    }

    public addKeybind(shortcut_id: string, keybind: string) {
        const id: string = _SHORTCUT_PREFIX + shortcut_id;
        mainWindow()?.emit("Overfloat://AddKeybind", {
            shortcut_id: id,
            keybind: keybind,
        });
    }

    public changeKeybind(
        shortcut_id: string,
        oldKeybind: string,
        newKeybind: string
    ) {
        const id: string = _SHORTCUT_PREFIX + shortcut_id;
        mainWindow()?.emit("Overfloat://ChangeKeybind", {
            shortcut_id: id,
            oldKeybind: oldKeybind,
            newKeybind: newKeybind,
        });
    }

    public removeKeybind(shortcut_id: string, keybind: string) {
        const id: string = _SHORTCUT_PREFIX + shortcut_id;
        mainWindow()?.emit("Overfloat://RemoveKeybind", {
            shortcut_id: id,
            keybind: keybind,
        });
    }
}

export const ShortcutManager = Object.freeze(_ShortcutManager.getInstance());

export function watchPath(id: string, path: string, callback: () => void) {
    invoke("watch_path", { path: path, windowLabel: appWindow.label, id: id });
    listen("Overfloat://FSEvent/" + id, (event) => {
        console.log(event);
        callback();
    });
}

export async function clipboardRead() {
    return readText();
}

export async function clipboardWrite(text: string) {
    return writeText(text);
}
