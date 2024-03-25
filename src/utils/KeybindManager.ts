export type Shortcut = {
    id: string;
    name: string;
    description: string;
    callback: Function;
    boundKeys: Set<string>;
};

export class KeybindManager {
    private static instance: KeybindManager;
    private shortcuts = new Map<string, Map<string, Shortcut>>();
    private keybinds = new Map<string, Set<Function>>();
    private subscribers: Set<Function>;

    private constructor() {
        this.subscribers = new Set<Function>();
        console.log("Creating new EventManager");
    }

    public subscribe(subscriber: Function): void {
        this.subscribers.add(subscriber);
    }

    public unsubscribe(subscriber: Function): void {
        this.subscribers.delete(subscriber);
    }

    private notifySubscribers(): void {
        for (const subscriber of this.subscribers) {
            subscriber();
        }
    }

    public static getInstance(): KeybindManager {
        if (!KeybindManager.instance) {
            console.log("Creating new KeybindManager");
            KeybindManager.instance = new KeybindManager();
        }

        return KeybindManager.instance;
    }

    public addShortcut(module: string, id: string, name: string, description: string, callback: Function, defaultKeybind?: string) {
        if (!this.shortcuts.has(module)) {
            this.shortcuts.set(module, new Map<string, Shortcut>());
        }

        const keybind: Shortcut = { id: id, name: name, description: description, callback: callback, boundKeys: new Set<string>() };

        this.shortcuts.get(module)?.set(id, keybind);

        if (defaultKeybind) {
            this.addKeybind(module, id, defaultKeybind, true);
        }

        this.notifySubscribers();
    }

    public removeShortcut(module: string, id: string) {
        const shortcut = this.shortcuts.get(module)?.get(id);

        shortcut?.boundKeys.forEach((key: string) => {
            this.keybinds.get(key)?.delete(shortcut.callback);
        });

        this.shortcuts.get(module)?.delete(id);
        this.notifySubscribers();
    }

    public addKeybind(module: string, id: string, keybind: string, skipNotify?: boolean) {
        const shortcut = this.shortcuts.get(module)?.get(id);

        if (!shortcut) {
            return;
        }

        shortcut.boundKeys.add(keybind);

        if (!this.keybinds.get(keybind)) {
            this.keybinds.set(keybind, new Set<Function>());
        }

        this.keybinds.get(keybind)?.add(shortcut.callback);

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    public removeKeybind(module: string, id: string, keybind: string, skipNotify?:boolean) {
        const shortcut = this.shortcuts.get(module)?.get(id);

        if(!shortcut){
            return;
        }

        shortcut.boundKeys.delete(keybind);

        this.keybinds.get(keybind)?.delete(shortcut.callback);

        if(!skipNotify){
            this.notifySubscribers();
        }
    }

    public changeKeybind(module: string, id: string, oldKeybind: string, newKeybind: string){
        const shortcut = this.shortcuts.get(module)?.get(id);

        if(!shortcut){
            return;
        }

        this.removeKeybind(module, id, oldKeybind, true);
        this.addKeybind(module, id, newKeybind, true);

        this.notifySubscribers();
    }

    public getShortcuts(){
        return this.shortcuts;
    }

    public getKeybinds(){
        return this.keybinds;
    }
}
