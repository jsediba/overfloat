/*****************************************************************************
 * @FilePath    : src/utils/KeybindManager.ts                                *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { ModuleManager } from "./ModuleManager";
import { OverfloatModule } from "./OverfloatModule";
import { Shortcut } from "./Shortcut";

/**
 * @brief Singleton class for managing keybinds
 * Includes subscribing for react components to listen for changes
 */
export class KeybindManager {
    private static instance: KeybindManager;
    private subscribers: Set<Function>;

    // Map of bound keys to shortcuts
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

    /**
     * @brief Add a new shortcut to the keybind manager
     * @param moduleName Name of the module
     * @param windowLabel Label of the webview window
     * @param id ID of the shortcut
     * @param name Name of the shortcut
     * @param description Description of the shortcut
     * @param defaultKeybinds Default keybinds for the shortcut
     * @param skipNotify Skip notifying subscribers, used for batch operations
     * @returns
     */
    public addShortcut(
        moduleName: string,
        windowLabel: string,
        id: string,
        name: string,
        description: string,
        defaultKeybinds: string[] = [],
        skipNotify: boolean = false
    ) {
        // Get the module and add the shortcut
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

        // Remove duplicate keybinds
        const boundKeys = shortcut
            .getBoundKeys()
            .filter((value, index, self) => self.indexOf(value) === index);

        // Add the shortcut to the keybinds map
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

    /**
     * @brief Remove a shortcut from the keybind manager
     * @param moduleName Name of the module
     * @param windowLabel Label of the webview window
     * @param id ID of the shortcut
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public removeShortcut(
        moduleName: string,
        windowLabel: string,
        id: string,
        skipNotify: boolean = false
    ) {
        // Get the module and the shortcut
        const module: OverfloatModule | undefined = ModuleManager.getInstance()
            .getActiveModules()
            .get(moduleName);

        const shortcut: Shortcut | undefined = module
            ?.getWindowShortcuts(windowLabel)
            ?.get(id);

        // Remove the shortcut from the keybinds map
        shortcut?.getBoundKeys().forEach((key) => {
            this.keybinds.get(key)?.delete(shortcut);
        });

        // Remove the shortcut from the module
        module?.removeShortcut(windowLabel, id, true);

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    /**
     * @brief Add a new keybind to a shortcut
     * @param moduleName Name of the module
     * @param windowLabel Label of the webview window
     * @param id ID of the shortcut
     * @param keybind Keybind to add
     * @param skipNotify Skip notifying subscribers, used for batch operations
     * @returns
     */
    public addKeybind(
        moduleName: string,
        windowLabel: string,
        id: string,
        keybind: string,
        skipNotify: boolean = false
    ) {
        // Get the module and the shortcut
        const module: OverfloatModule | undefined = ModuleManager.getInstance()
            .getActiveModules()
            .get(moduleName);

        const shortcut: Shortcut | undefined = module
            ?.getWindowShortcuts(windowLabel)
            ?.get(id);

        if (shortcut == undefined) return;

        // Check if the keybind is already bound
        if (shortcut.getBoundKeys().includes(keybind)) return;

        // Add the keybind to the shortcut
        shortcut?.addKeybind(keybind);

        // Add the shortcut to the keybinds map
        if (!this.keybinds.has(keybind)) {
            this.keybinds.set(keybind, new Set<Shortcut>());
        }

        this.keybinds.get(keybind)?.add(shortcut);

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    /**
     * @brief Remove all keybinds from a shortcut
     * @param moduleName Name of the module
     * @param windowLabel Label of the webview window
     * @param id ID of the shortcut
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public removeAllKeybinds(
        moduleName: string,
        windowLabel: string,
        id: string,
        skipNotify: boolean = false
    ) {
        // Get the module and the shortcut
        const module: OverfloatModule | undefined = ModuleManager.getInstance()
            .getActiveModules()
            .get(moduleName);

        const shortcut: Shortcut | undefined = module
            ?.getWindowShortcuts(windowLabel)
            ?.get(id);

        if (shortcut == undefined) return;

        // Remove all keybinds from the shortcut
        const keybinds = [...shortcut.getBoundKeys()];
        keybinds.forEach((keybind: string) => {
            this.keybinds.get(keybind)?.delete(shortcut);
        });
        shortcut.removeBoundKeys();

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    /**
     * @brief Remove a keybind from a shortcut
     * @param moduleName Name of the module
     * @param windowLabel Label of the webview window
     * @param id ID of the shortcut
     * @param position Index of the keybind to remove in the bound keys array
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public removeKeybind(
        moduleName: string,
        windowLabel: string,
        id: string,
        position: number,
        skipNotify: boolean = false
    ) {
        // Get the module and the shortcut
        const module: OverfloatModule | undefined = ModuleManager.getInstance()
            .getActiveModules()
            .get(moduleName);

        const shortcut: Shortcut | undefined = module
            ?.getWindowShortcuts(windowLabel)
            ?.get(id);

        if (shortcut == undefined) return;

        // Remove the keybind from the shortcut
        const removedKey: string | undefined = shortcut.removeKeybind(position);

        // If no keybind was removed, return
        if (removedKey == undefined) return;

        // Remove the shortcut from the keybinds map
        this.keybinds.get(removedKey)?.delete(shortcut);

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    /**
     * @brief Change a keybind in a shortcut
     * @param moduleName Name of the module
     * @param windowLabel Label of the webview window
     * @param id ID of the shortcut
     * @param position Index of the keybind to change in the bound keys array
     * @param keybind New keybind
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public changeKeybind(
        moduleName: string,
        windowLabel: string,
        id: string,
        position: number,
        keybind: string,
        skipNotify: boolean = false
    ) {
        // Get the module and the shortcut
        const module: OverfloatModule | undefined = ModuleManager.getInstance()
            .getActiveModules()
            .get(moduleName);

        const shortcut: Shortcut | undefined = module
            ?.getWindowShortcuts(windowLabel)
            ?.get(id);

        if (shortcut == undefined) return;

        // Check if the keybind is already bound
        const alreadyBound = keybind in shortcut.getBoundKeys();
        if (alreadyBound) return;

        // Change the keybind in the shortcut
        const removedKey: string | undefined = shortcut.changeKeybind(
            position,
            keybind
        );

        // If no keybind was removed, return
        if (removedKey == undefined) return;

        // Remove the shortcut from the keybinds map
        this.keybinds.get(removedKey)?.delete(shortcut);

        // Add the shortcut to the keybinds map
        if (!this.keybinds.has(keybind))
            this.keybinds.set(keybind, new Set<Shortcut>());

        this.keybinds.get(keybind)?.add(shortcut);

        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    /**
     * @brief Get all keybinds
     * @returns Map of keybinds to shortcuts
     */
    public getKeybinds(): Map<string, Set<Shortcut>> {
        return this.keybinds;
    }
}
