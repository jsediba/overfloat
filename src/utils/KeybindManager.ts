export type Shortcut = {
    windowLabel:string;
    id: string;
    name: string;
    description: string;
    boundKeys: Set<string>;
};

export class KeybindManager {
    private static instance: KeybindManager;
    private subscribers: Set<Function>;
    
    private shortcuts = new Map<string, Map<string, Shortcut>>();
    private keybinds = new Map<string, Set<Shortcut>>();

    public static getInstance(): KeybindManager {
        if (!KeybindManager.instance) {
            KeybindManager.instance = new KeybindManager();
        }

        return KeybindManager.instance;
    }

    private constructor() {
        this.subscribers = new Set<Function>();
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

    public addShortcut(module: string, windowLabel:string, id: string, name: string, description: string, defaultKeybinds?: string[]) {
        if (!this.shortcuts.has(module)) {
            this.shortcuts.set(module, new Map<string, Shortcut>());
        }

        const shortcut: Shortcut = { windowLabel:windowLabel, id: id, name: name, description: description, boundKeys: new Set<string>() };

        this.shortcuts.get(module)?.set(id, shortcut);

        if (defaultKeybinds) {
            defaultKeybinds.forEach((keybind) => this.addKeybind(module, id, keybind, true))
        }

        this.notifySubscribers();
    }

    public removeShortcut(module: string, id: string) {
        const shortcut = this.shortcuts.get(module)?.get(id);

        shortcut?.boundKeys.forEach((key: string) => {
            this.keybinds.get(key)?.delete(shortcut);
        });

        this.shortcuts.get(module)?.delete(id);

        if(this.shortcuts.get(module)?.size == 0){
            this.shortcuts.delete(module);
        }

        this.notifySubscribers();
    }

    public addKeybind(module: string, id: string, keybind: string, skipNotify?: boolean) {
        const shortcut = this.shortcuts.get(module)?.get(id);

        if (!shortcut) {
            return;
        }

        shortcut.boundKeys.add(keybind);

        if (!this.keybinds.get(keybind)) {
            this.keybinds.set(keybind, new Set<Shortcut>());
        }

        this.keybinds.get(keybind)?.add(shortcut);

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

        this.keybinds.get(keybind)?.delete(shortcut);

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
