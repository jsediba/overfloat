import { listen } from "@tauri-apps/api/event";
import { KeybindManager, Shortcut } from "./KeybindManager";

export type OverfloatEvent<T> = {
    event: string;
    windowLabel: string;
    payload: T;
    id: number;
};

export type AddShortcutEventPayload = {
    id: string,
    name: string,
    description: string,
    callback: Function,
    defaultKeybind?: string
}

export type RemoveShortcutEventPayload = {
    id: string,
}

export type AddKeybindEventPayload = {
    id: string,
    keybind: string
}

export type ChangeKeybindEventPayload = {
    id: string,
    oldKeybind: string,
    newKeybind: string
}

export class KeybindEventHandler {
    private static instance: KeybindEventHandler;
    private keybindManager: KeybindManager;

    public static getInstance(): KeybindEventHandler {
        if (!KeybindEventHandler.instance) {
            console.log("Creating new KeybindEventHandler");
            KeybindEventHandler.instance = new KeybindEventHandler();
        }

        return KeybindEventHandler.instance;
    }
    private constructor() {
        this.keybindManager = KeybindManager.getInstance();


        listen("Overfloat://AddShortcut", (event: OverfloatEvent<AddShortcutEventPayload>) => this.addShortcut(event))
        listen("Overfloat://RemoveShortcut", (event: OverfloatEvent<RemoveShortcutEventPayload>) => this.removeShortcut(event))
        
        listen("Overfloat://AddKeybind", (event: OverfloatEvent<AddKeybindEventPayload>) => this.addKeybind(event));
        listen("Overfloat://RemoveKeybind", (event: OverfloatEvent<AddKeybindEventPayload>) => this.removeKeybind(event));
        listen("Overfloat://ChangeKeybind", (event: OverfloatEvent<ChangeKeybindEventPayload>) => this.changeKeybind(event));
    }

    private getModuleName(windowLabel: string):string {
        const moduleName = windowLabel.replace(/module\/([^/]*)(\/.*)?/g, '$1');
        return moduleName
    }

    private addShortcut(event: OverfloatEvent<AddShortcutEventPayload>) {
        this.keybindManager.addShortcut(this.getModuleName(event.windowLabel),event.payload.id, event.payload.name, event.payload.description, event.payload.callback, event.payload.defaultKeybind);
    }

    private removeShortcut(event: OverfloatEvent<RemoveShortcutEventPayload>) {
        this.keybindManager.removeShortcut(this.getModuleName(event.windowLabel), event.payload.id);
    }

    private addKeybind(event:OverfloatEvent<AddKeybindEventPayload>){
        this.keybindManager.addKeybind(this.getModuleName(event.windowLabel), event.payload.id, event.payload.keybind)
    }

    private removeKeybind(event:OverfloatEvent<AddKeybindEventPayload>){
        this.keybindManager.removeKeybind(this.getModuleName(event.windowLabel), event.payload.id, event.payload.keybind)
    }

    private changeKeybind(event:OverfloatEvent<ChangeKeybindEventPayload>){
        this.keybindManager.changeKeybind(this.getModuleName(event.windowLabel), event.payload.id, event.payload.oldKeybind, event.payload.newKeybind);
    }
}
