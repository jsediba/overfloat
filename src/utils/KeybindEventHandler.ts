import { listen } from "@tauri-apps/api/event";
import { KeybindManager } from "./KeybindManager";
import { WebviewWindow } from "@tauri-apps/api/window";
import { OverfloatEvent } from "./WindowEventHandler";

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

export class KeybindEventHandler {
    private static instance: KeybindEventHandler;

    public static getInstance(): KeybindEventHandler {
        if (!KeybindEventHandler.instance) {
            KeybindEventHandler.instance = new KeybindEventHandler();
        }

        return KeybindEventHandler.instance;
    }

    private constructor() {
        listen(
            "Overfloat://GlobalKeypress",
            (event: OverfloatEvent<KeypressEventPayload>) =>
                this.handleKeypress(event)
        );

        listen(
            "Overfloat://AddShortcut",
            (event: OverfloatEvent<AddShortcutEventPayload>) =>
                this.addShortcut(event)
        );
        listen(
            "Overfloat://RemoveShortcut",
            (event: OverfloatEvent<RemoveShortcutEventPayload>) => {
                this.removeShortcut(event)
            }
        );

    }

    private getModuleName(windowLabel: string): string {
        const moduleName = windowLabel.replace(/module\/([^/]*)(\/.*)?/g, "$1");
        return moduleName;
    }

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

    private removeShortcut(event: OverfloatEvent<RemoveShortcutEventPayload>) {
        KeybindManager.getInstance().removeShortcut(
            this.getModuleName(event.windowLabel),
            event.windowLabel,
            event.payload.id,
        );
    }
}
