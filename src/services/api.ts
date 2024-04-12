import { WebviewWindow, appWindow } from "@tauri-apps/api/window";
import { UnlistenFn, listen, once } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api";
import { readText, writeText } from "@tauri-apps/api/clipboard";
import { WindowEventType } from "../utils/WindowEventHandler";
import { NameValuePairs } from "../utils/OverfloatModule";
import { OverfloatEvent } from "../utils/WindowEventHandler";

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
        const listeners = new Map<string, Promise<UnlistenFn>>(this.listeners);

        listeners.forEach((_, shortcut_id) => {
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

export async function clipboardRead() {
    const content = await readText();
    return content == null ? "" : content;
}

export async function clipboardWrite(text: string) {
    return writeText(text);
}

function getModuleName(): string {
    const moduleName = appWindow.label.replace(/module\/([^/]*)(\/.*)?/g, "$1");
    return moduleName;
}

export async function writeFile(content: string, path: string, useRelativePath: boolean, appendMode: boolean): Promise<FSResult> {
    return await invoke<FSResult>("write_file", { content: content, pathStr: path, appendMode: appendMode, useRelativePath: useRelativePath, moduleName: getModuleName() });
}

export async function readFile(path: string, useRelativePath: boolean): Promise<FSResult> {
    return await invoke<FSResult>("read_file", { pathStr: path, useRelativePath: useRelativePath, moduleName: getModuleName() });
}

export type FSResult = {
    successful: boolean;
    path: string;
    message: string;
}

export enum FSEventKind {
    Create,
    Remove,
    Modify,
    Rename
}

export type FSEvent = {
    eventKind: FSEventKind,
    isDir: boolean,
    path: string,
    pathOld: string,
}

type FSPayload = {
    kind: number,
    is_dir: boolean,
    path: string,
    path_old: string
}

function triggerFSEventCallback(payload: FSPayload, callback: (event: FSEvent) => void) {
    console.log("Inside trigger API payload is: ", payload);
    let eventKind: FSEventKind;
    switch (payload.kind) {
        case 0:
            eventKind = FSEventKind.Create;
            break;
        case 1:
            eventKind = FSEventKind.Remove;
            break;
        case 2:
            eventKind = FSEventKind.Modify;
            break;
        case 3:
            eventKind = FSEventKind.Rename;
            break;
        default:
            return;
    }
    callback({ eventKind: eventKind, isDir: payload.is_dir, path: payload.path, pathOld: payload.path_old });
}



class _WatchManager {
    private static instance: _WatchManager;
    private listeners: Map<string, Promise<UnlistenFn>>;

    private constructor() {
        this.listeners = new Map<string, Promise<UnlistenFn>>();

        once("Overfloat://Close", () => {
            this.listeners.forEach((listener) => listener.then((f) => f()));
            appWindow.close();
        });
    }

    public static getInstance(): _WatchManager {
        if (!_WatchManager.instance) {
            _WatchManager.instance = new _WatchManager();
        }

        return _WatchManager.instance;
    }

    public watchPath(id: string, path: string, callback: (event: FSEvent) => void) {
        const unlisten = this.listeners.get(id);
        if (unlisten != undefined) {
            this.stopWatching(id);
        }

        invoke("watch_path", { path: path, windowLabel: appWindow.label, id: id });
        const listener = listen("Overfloat://FSEvent/" + id, (event: OverfloatEvent<FSPayload>) => {
            triggerFSEventCallback(event.payload, callback);
        });

        this.listeners.set(id, listener);
    }

    public async stopWatching(id: string) {
        const unlisten = this.listeners.get(id);
        if (unlisten == undefined) return;
        await invoke("stop_watching", { windowLabel: appWindow.label, id: id });
        unlisten.then(f => f());
        this.listeners.delete(id);
    }

    public stopAll() {
        const listeners = new Map<string, Promise<UnlistenFn>>(this.listeners);

        listeners.forEach((_, watcher_id) => {
            this.stopWatching(watcher_id);
        });
    }
}

export const WatchManager = Object.freeze(_WatchManager.getInstance());
