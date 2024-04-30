/*****************************************************************************
 * @FilePath    : src/Api/FSOperations.ts                                    *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { appWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/tauri";
import { UnlistenFn, once, listen } from "@tauri-apps/api/event";
import { OverfloatEvent } from "../utils/WindowEventHandler";

// Type for a result of a file system operation
/**
 * @brief Type for a result of a file system operation
 * @param successful True if the operation was successful
 * @param path Path to the file
 * @param message Message describing the result of the operation
*/
export type FSResult = {
    successful: boolean;
    path: string;
    message: string; 
};

// Enum for different kinds of file system events
export enum FSEventKind {
    Create,
    Remove,
    Modify,
    Rename,
}

/**
 * @brief Type for a file system event
 * @param eventKind Type of the event
 * @param isDir True if the event is related to a directory
 * @param path Path where the event occurred
 * @param pathOld Old path in case of a rename event, same as path otherwise
 * @param timestamp Timestamp of the event
 */
export type FSEvent = {
    eventKind: FSEventKind;
    isDir: boolean;
    path: string;
    pathOld: string;
    timestamp: Date;
};

// Type for a payload of a file system event from the backend
type FSPayload = {
    kind: number;
    is_dir: boolean;
    path: string;
    path_old: string;
    timestamp: number;
};

/**
 * @brief Get the name of the module from the window label
 * @returns Name of the module
 */
function getModuleName(): string {
    const moduleName = appWindow.label.replace(/module\/([^/]*)(\/.*)?/g, "$1");
    return moduleName;
}

/**
 * @brief Write text to a file
 * @param content Text to be written to the file
 * @param path Path to the file
 * @param useRelativePath If true, the path is relative to the module's directory, otherwise it is absolute
 * @param appendMode If true, the content is appended to the file, otherwise the file content is overwritten
 * @returns Result of the write operation
 * @note The result of the write operation contains the following fields:
 * .successful contains success flag of the operation,
 * .path contains the path to the modified file,
 * .message contains an error message on failure.
 */
export async function writeFile(
    content: string,
    path: string,
    useRelativePath: boolean,
    appendMode: boolean
): Promise<FSResult> {
    return await invoke<FSResult>("write_file", {
        content: content,
        pathStr: path,
        appendMode: appendMode,
        useRelativePath: useRelativePath,
        moduleName: getModuleName(),
    });
}

/**
 * @brief Read text from a file
 * @param path Path to the file
 * @param useRelativePath If true, the path is relative to the module's directory, otherwise it is absolute
 * @returns Result of the read operation
 * @note The result of the read operation contains the following fields:
 * .successful contains success flag of the operation,
 * .path contains the path to the file,
 * .message contains the content of the file on success or an error message on failure.
 */
export async function readFile(
    path: string,
    useRelativePath: boolean
): Promise<FSResult> {
    return await invoke<FSResult>("read_file", {
        pathStr: path,
        useRelativePath: useRelativePath,
        moduleName: getModuleName(),
    });
}

/**
 * @brief Triggers a callback function when a file system event occurs
 * @param payload Payload of the event from the backend
 * @param callback Callback function to be triggered
 */
function triggerFSEventCallback(
    payload: FSPayload,
    callback: (event: FSEvent) => void
) {
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
    callback({
        eventKind: eventKind,
        isDir: payload.is_dir,
        path: payload.path,
        pathOld: payload.path_old,
        timestamp: new Date(payload.timestamp),
    });
}

/**
 * @brief Singleton class for managing file system event listeners.
 * @details A separate instance of this class is created for each window.
 */
class _WatchManager {
    private static instance: _WatchManager;
    private listeners: Map<string, Promise<UnlistenFn>>;

    private constructor() {
        this.listeners = new Map<string, Promise<UnlistenFn>>();

        // Close all listeners when the window is closed
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

    /**
     * @brief Start watching a path for file system events
     * @param id ID of the watcher
     * @param path Path to the directory to be watched
     * @param callback Callback function to be triggered when an event occurs
     */
    public watchPath(
        id: string,
        path: string,
        callback: (event: FSEvent) => void
    ) {
        // Stop the watcher of the same ID if it already exists
        const unlisten = this.listeners.get(id);
        if (unlisten != undefined) {
            this.stopWatching(id);
        }

        // Start watching the path
        invoke("watch_path", {
            path: path,
            windowLabel: appWindow.label,
            id: id,
        });

        // Listen for file system events
        const listener = listen(
            "Overfloat://FSEvent/" + id,
            (event: OverfloatEvent<FSPayload>) => {
                triggerFSEventCallback(event.payload, callback);
            }
        );

        // Save the listener
        this.listeners.set(id, listener);
    }

    /**
     * @brief Stop watching a path for file system events
     * @param id ID of the watcher
     */
    public async stopWatching(id: string) {
        const unlisten = this.listeners.get(id);
        if (unlisten == undefined) return;
        await invoke("stop_watching", { windowLabel: appWindow.label, id: id });
        unlisten.then((f) => f());
        this.listeners.delete(id);
    }

    /**
     * @brief Stop all file system event watchers
     */
    public stopAll() {
        const listeners = new Map<string, Promise<UnlistenFn>>(this.listeners);

        listeners.forEach((_, watcher_id) => {
            this.stopWatching(watcher_id);
        });
    }
}

// Export the singleton instance of the WatchManager
export const WatchManager = Object.freeze(_WatchManager.getInstance());
