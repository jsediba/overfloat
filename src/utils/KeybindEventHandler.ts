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
    private shortcuts: Map<string, Map<string, Shortcut>>;
    private keybinds: Map<string, Set<Function>>;

    public static getInstance(): KeybindEventHandler {
        if (!this.instance) {
            console.log("Creating new KeybindEventHandler");
            this.instance = new KeybindEventHandler();
        }

        return this.instance;
    }
    private constructor() {
        this.shortcuts = KeybindManager.getShortcuts();
        this.keybinds = KeybindManager.getKeybinds();

        listen("Overfloat://AddShortcut", (event: OverfloatEvent<AddShortcutEventPayload>) => this.addShortcut(event))
        listen("Overfloat://RemoveShortcut", (event: OverfloatEvent<RemoveShortcutEventPayload>) => this.removeShortcut(event))
        
        listen("Overfloat://AddKeybind", (event: OverfloatEvent<AddKeybindEventPayload>) => this.addKeybind(event));
        listen("Overfloat://RemoveKeybind", (event: OverfloatEvent<AddKeybindEventPayload>) => this.removeKeybind(event));
        listen("Overfloat://ChangeKeybind", (event: OverfloatEvent<ChangeKeybindEventPayload>) => this.changeKeybind(event));


        KeybindManager.subscribe(this.updateKeybinds);
    }

    private updateKeybinds() {
        this.shortcuts = KeybindManager.getShortcuts();
        this.keybinds = KeybindManager.getKeybinds();
    }

    private getModuleName(windowLabel: string):string {
        const moduleName = windowLabel.replace(/module\/([^/]*)(\/.*)?/g, '$1');
        return moduleName
    }

    private addShortcut(event: OverfloatEvent<AddShortcutEventPayload>) {
        KeybindManager.addShortcut(this.getModuleName(event.windowLabel),event.payload.id, event.payload.name, event.payload.description, event.payload.callback, event.payload.defaultKeybind);
    }

    private removeShortcut(event: OverfloatEvent<RemoveShortcutEventPayload>) {
        KeybindManager.removeShortcut(this.getModuleName(event.windowLabel), event.payload.id);
    }

    private addKeybind(event:OverfloatEvent<AddKeybindEventPayload>){
        KeybindManager.addKeybind(this.getModuleName(event.windowLabel), event.payload.id, event.payload.keybind)
    }

    private removeKeybind(event:OverfloatEvent<AddKeybindEventPayload>){
        KeybindManager.removeKeybind(this.getModuleName(event.windowLabel), event.payload.id, event.payload.keybind)
    }

    private changeKeybind(event:OverfloatEvent<ChangeKeybindEventPayload>){
        KeybindManager.changeKeybind(this.getModuleName(event.windowLabel), event.payload.id, event.payload.oldKeybind, event.payload.newKeybind);
    }
}
