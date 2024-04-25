import { ModuleManager } from "./ModuleManager";
import { OverfloatModule } from "./OverfloatModule";
import { Shortcut } from "./Shortcut";

export class KeybindManager {
    private static instance: KeybindManager;
    private subscribers: Set<Function>;

    private keybinds: Map<string, Set<Shortcut>> = new Map<
        string,
        Set<Shortcut>
    >();

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

    public addShortcut(
        moduleName: string,
        windowLabel: string,
        id: string,
        name: string,
        description: string,
        defaultKeybinds: string[] = [],
        skipNotify: boolean = false
    ) {
        const module: OverfloatModule | undefined = ModuleManager.getInstance()
            .getActiveModules()
            .get(moduleName);
        if (module == undefined) return;

        const shortcut: Shortcut | undefined = module.addShortcut(
            windowLabel,
            id,
            name,
            description,
            defaultKeybinds
        );

        if (shortcut == undefined) return;

        // Remove duplicates
        const boundKeys = shortcut.getBoundKeys().filter(
            (value, index, self) => self.indexOf(value) === index
        );

        boundKeys.forEach((keybind) => {
            if (!this.keybinds.has(keybind)) {
                this.keybinds.set(keybind, new Set<Shortcut>());
            }
            this.keybinds.get(keybind)?.add(shortcut);
        });

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    public removeShortcut(
        moduleName: string,
        windowLabel: string,
        id: string,
        skipNotify: boolean = false
    ) {
        const module: OverfloatModule | undefined = ModuleManager.getInstance()
            .getActiveModules()
            .get(moduleName);

        const shortcut: Shortcut | undefined = module
            ?.getWindowShortcuts(windowLabel)
            ?.get(id);

        shortcut?.getBoundKeys().forEach((key) => {
            this.keybinds.get(key)?.delete(shortcut);
        });

        module?.removeShortcut(windowLabel, id, true);

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    public addKeybind(
        moduleName: string,
        windowLabel: string,
        id: string,
        keybind: string,
        skipNotify: boolean = false
    ) {
        const module: OverfloatModule | undefined = ModuleManager.getInstance()
            .getActiveModules()
            .get(moduleName);

        const shortcut: Shortcut | undefined = module
            ?.getWindowShortcuts(windowLabel)
            ?.get(id);

        if (shortcut == undefined) return;

        // Prevent duplicates
        if (shortcut.getBoundKeys().includes(keybind)) return;

        shortcut?.addKeybind(keybind);

        if (!this.keybinds.has(keybind)) {
            this.keybinds.set(keybind, new Set<Shortcut>());
        }

        this.keybinds.get(keybind)?.add(shortcut);

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    public removeAllKeybinds(
        moduleName: string,
        windowLabel: string,
        id: string,
        skipNotify: boolean = false
    ) {
        const module: OverfloatModule | undefined = ModuleManager.getInstance()
            .getActiveModules()
            .get(moduleName);

        const shortcut: Shortcut | undefined = module
            ?.getWindowShortcuts(windowLabel)
            ?.get(id);

        if (shortcut == undefined) return;

        const keybinds = [...shortcut.getBoundKeys()];
        keybinds.forEach((keybind: string) => {
            this.keybinds.get(keybind)?.delete(shortcut);
        });
        shortcut.removeBoundKeys();

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    public removeKeybind(
        moduleName: string,
        windowLabel: string,
        id: string,
        position: number,
        skipNotify: boolean = true
    ) {
        const module: OverfloatModule | undefined = ModuleManager.getInstance()
            .getActiveModules()
            .get(moduleName);

        const shortcut: Shortcut | undefined = module
            ?.getWindowShortcuts(windowLabel)
            ?.get(id);

        if (shortcut == undefined) return;

        const removedKey: string | undefined = shortcut.removeKeybind(position);

        if (removedKey == undefined) return;

        this.keybinds.get(removedKey)?.delete(shortcut);

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    public changeKeybind(
        moduleName: string,
        windowLabel: string,
        id: string,
        position: number,
        keybind: string,
        skipNotify: boolean = false
    ) {
        const module: OverfloatModule | undefined = ModuleManager.getInstance()
            .getActiveModules()
            .get(moduleName);

        const shortcut: Shortcut | undefined = module
            ?.getWindowShortcuts(windowLabel)
            ?.get(id);

        if (shortcut == undefined) return;

        const alreadyBound = keybind in shortcut.getBoundKeys();

        const removedKey: string | undefined = shortcut.changeKeybind(
            position,
            keybind
        );

        if (removedKey == undefined) return;

        this.keybinds.get(removedKey)?.delete(shortcut);

        if (!alreadyBound) {

            if (!this.keybinds.has(keybind))
                this.keybinds.set(keybind, new Set<Shortcut>());


            this.keybinds.get(keybind)?.add(shortcut);
        }

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    public getKeybinds(): Map<string, Set<Shortcut>> {
        return this.keybinds;
    }
}
