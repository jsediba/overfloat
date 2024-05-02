/*****************************************************************************
 * @FilePath    : src/utils/KeybindEventHandler.ts                           *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { KeybindManager } from "./KeybindManager";
import { WebviewWindow } from "@tauri-apps/api/window";
import { OverfloatEvent } from "./WindowEventHandler";

// Types for different payload used in custom OverfloatEvents(custom Tauri events)
export type AddShortcutEventPayload = {
    id: string;
    name: string;
    description: string;
    defaultKeybinds?: string[];
};

export type RemoveShortcutEventPayload = {
    id: string;
};

export type KeypressEventPayload = {
    key: string;
};

/**
 * @brief Singleton class for handling keybind related events
 */
export class KeybindEventHandler {
    private static instance: KeybindEventHandler;
    private keypressUnlisten: Promise<UnlistenFn>;

    public static getInstance(): KeybindEventHandler {
        if (!KeybindEventHandler.instance) {
            KeybindEventHandler.instance = new KeybindEventHandler();
        }

        return KeybindEventHandler.instance;
    }

    private constructor() {
        // Listen for Key Press events from backend
        this.keypressUnlisten = listen(
            "Overfloat://GlobalKeypress",
            (event: OverfloatEvent<KeypressEventPayload>) =>
                this.handleKeypress(event)
        );

        // Listen for shortcut related events from the API
        listen(
            "Overfloat://AddShortcut",
            (event: OverfloatEvent<AddShortcutEventPayload>) =>
                this.addShortcut(event)
        );
        listen(
            "Overfloat://RemoveShortcut",
            (event: OverfloatEvent<RemoveShortcutEventPayload>) => {
                this.removeShortcut(event);
            }
        );
    }

    /**
     * @brief Extracts module name from the label of a webview window
     * @param windowLabel Label of the webview window
     * @returns Name of the module the window belongs to
     */
    private getModuleName(windowLabel: string): string {
        const moduleName = windowLabel.replace(/module\/([^/]*)(\/.*)?/g, "$1");
        return moduleName;
    }

    /**
     * @brief Handles KeyPress events from the backend
     * @param event OverfloatEvent containing the keypress event payload
     */
    private handleKeypress(event: OverfloatEvent<KeypressEventPayload>) {
        KeybindManager.getInstance()
            .getKeybinds()
            .get(event.payload.key)
            ?.forEach((shortcut) => {
                WebviewWindow.getByLabel(shortcut.getWindowLabel())?.emit(
                    "Overfloat://Shortcut/" + shortcut.getId()
                );
            });
    }

    /**
     * @brief Adds a new shortcut to the KeybindManager after a request from the API
     * @param event OverfloatEvent containing the AddShortcutEventPayload
     */
    private addShortcut(event: OverfloatEvent<AddShortcutEventPayload>) {
        KeybindManager.getInstance().addShortcut(
            this.getModuleName(event.windowLabel),
            event.windowLabel,
            event.payload.id,
            event.payload.name,
            event.payload.description,
            event.payload.defaultKeybinds
        );
    }

    /**
     * @brief Removes a shortcut from the KeybindManager after a request from the API
     * @param event OverfloatEvent containing the RemoveShortcutEventPayload
     */
    private removeShortcut(event: OverfloatEvent<RemoveShortcutEventPayload>) {
        KeybindManager.getInstance().removeShortcut(
            this.getModuleName(event.windowLabel),
            event.windowLabel,
            event.payload.id
        );
    }

    /**
     * @brief Stops listening for KeyPress events from the backend
     * This prevents event propagation during keybind editing
     */
    public async stopListening() {
        await this.keypressUnlisten.then((f) => f());
    }

    /**
     * @brief Starts listening for KeyPress events from the backend
     * This is used to enable the keybinds after editing
     */
    public startListening() {
        this.keypressUnlisten = listen(
            "Overfloat://GlobalKeypress",
            (event: OverfloatEvent<KeypressEventPayload>) =>
                this.handleKeypress(event)
        );
    }
}
