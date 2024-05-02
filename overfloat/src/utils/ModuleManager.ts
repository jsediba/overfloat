/*****************************************************************************
 * @FilePath    : src/utils/ModuleManager.ts                                 *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { OverfloatModule, SerializedModule, Window } from "./OverfloatModule";
import { invoke } from "@tauri-apps/api";
import { SerializedShortcut } from "./Shortcut";
import { MODULE_NAMES } from "../App";

// Types for different serialized data
type SerializedProfiles = {
    [profileName: string]: SerializedModule[];
};

type SerializedConfig = {
    [key: string]: string;
};

/**
 * @brief Singleton class for managing modules
 * Includes subscribing for react components to listen for changes
 */
export class ModuleManager {
    private static instance: ModuleManager;
    private subscribers: Set<Function>;

    private allModules: string[] = [];
    private activeModules = new Map<string, OverfloatModule>();

    private profiles: SerializedProfiles = {};
    private config: SerializedConfig = {};

    private constructor() {
        this.subscribers = new Set<Function>();
        this.initialLoad();
    }

    /**
     * @brief Load all modules, profiles and config from the backend
     */
    async initialLoad() {
        this.setupModules();
        await this.loadProfiles();
        await this.loadConfig();
        this.loadProfile(this.config["activeProfile"]);
        this.notifySubscribers();
    }

    /**
     * @brief Load the config from the backend
     */
    async loadConfig() {
        // Load the config from the backend
        const configString: string = await invoke<string>("get_config");
        try {
            this.config = JSON.parse(configString);
        } catch {
            this.config = { activeProfile: "" };
            this.saveConfig();
        }
    }

    /**
     * @brief Save the config to the backend
     */
    async saveConfig() {
        await invoke("save_config", {
            configJson: JSON.stringify(this.config, null, "\t"),
        });
    }

    /**
     * @brief Save the profiles to the backend
     */
    async saveProfiles() {
        await invoke("save_profiles", {
            profilesJson: JSON.stringify(this.profiles, null, "\t"),
        });
    }

    /**
     * @brief Load the profiles from the backend
     */
    async loadProfiles() {
        const profilesString: string = await invoke<string>("get_profiles");
        try {
            this.profiles = JSON.parse(profilesString);
        } catch (_) {
            this.profiles = {};
            this.saveProfiles();
        }
    }

    /**
     * @brief Close all modules and notify the subscribers
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public async closeAllModules(skipNotify: boolean = false) {
        const promises: Promise<void>[] = [];

        const activeModules: Map<string, OverfloatModule> = new Map<
            string,
            OverfloatModule
        >(this.activeModules);

        activeModules.forEach((module, moduleName) => {
            promises.push(module.getMainWindow().destroyedPromise);
            module.getSubwindows().forEach((subwindow) => {
                promises.push(subwindow.destroyedPromise);
            });
            this.closeModule(moduleName, true);
        });

        await Promise.all(promises).then(() => {});
        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    /**
     * @brief Load a specified profile
     * @param profileName Name of the profile to load
     */
    async loadProfile(profileName: string) {
        // If the profile does not exist, return
        if (!(profileName in this.profiles)) {
            return;
        }

        // Close all modules before loading the profile
        await this.closeAllModules();

        // Load the profile
        const profile: SerializedModule[] = this.profiles[profileName];

        // Prepare an array for promises to wait for visible windows to be created
        const promises: Promise<Window>[] = [];

        // Load the modules from the profile
        profile.forEach((serializedModule) => {
            // If the module is not in the list of all modules, skip it
            if (!this.allModules.includes(serializedModule.moduleName)) return;

            const module = this.startModule(
                serializedModule.moduleName,
                serializedModule.mainWindow.title,
                false,
                serializedModule.mainWindow.x,
                serializedModule.mainWindow.y,
                serializedModule.mainWindow.height,
                serializedModule.mainWindow.width,
                true,
                serializedModule.mainWindow.shortcuts
            );

            // If the main window is visible, add a promise to wait for the window to be created
            if (serializedModule.mainWindow.isVisible) {
                const promise: Promise<Window> = new Promise<Window>(
                    (resolve) => {
                        resolve(module.getMainWindow());
                    }
                );
                promises.push(promise);
            }

            // Load the subwindows, add promises for visible subwindows
            promises.push(...module.loadSubwindows(serializedModule));
        });

        // Set the active profile and save the config
        this.config["activeProfile"] = profileName;
        this.saveConfig();

        // Gather window created promises for all windows
        const webviewCreatedPromises: Promise<void>[] = [];
        this.activeModules.forEach((module) => {
            webviewCreatedPromises.push(module.getMainWindow().createdPromise);
            module.getSubwindows().forEach((subwindow) => {
                webviewCreatedPromises.push(subwindow.createdPromise);
            });
        });

        // Wait for all windows to be created
        await Promise.all(webviewCreatedPromises);

        // Wait for all visible windows to be created and show them
        await Promise.all(promises).then((windows: Window[]) => {
            windows.forEach((window) => {
                window.webview.show();
                window.visible = true;
            });

            // Notify subscribers of each module
            this.activeModules.forEach((module) => module.notifySubscribers());

            // Notify the subscribers of the module manager
            this.notifySubscribers();
        });
    }

    public static getInstance(): ModuleManager {
        if (!ModuleManager.instance) {
            ModuleManager.instance = new ModuleManager();
        }

        return ModuleManager.instance;
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
     * @brief Setup all modules from the backend
     */
    private setupModules() {
        let module_names: string[] = [...MODULE_NAMES];
        this.activeModules = new Map<string, OverfloatModule>();
        this.allModules = module_names;
    }

    /**
     * @brief Start a module
     * @param moduleName Name of the module to start
     * @param title Title of the main window
     * @param visible Visibility of the main window
     * @param x X position of the main window
     * @param y Y position of the main window
     * @param height Height of the main window
     * @param width Width of the main window
     * @param skipNotify Skip notifying subscribers, used for batch operations
     * @param savedShortcuts Shortcuts to load into the module
     * @returns
     */
    public startModule(
        moduleName: string,
        title: string = moduleName,
        visible: boolean = true,
        x: number = 0,
        y: number = 0,
        height: number = 300,
        width: number = 500,
        skipNotify: boolean = false,
        savedShortcuts: SerializedShortcut[] = []
    ): OverfloatModule {
        // If the module is already active, return it
        const activeModule = this.activeModules.get(moduleName);
        if (activeModule != undefined) return activeModule;

        // Create a new module and add it to the active modules
        const module = new OverfloatModule(
            moduleName,
            title,
            visible,
            x,
            y,
            height,
            width,
            savedShortcuts
        );
        this.activeModules.set(moduleName, module);

        if (!skipNotify) {
            this.notifySubscribers();
        }
        return module;
    }

    /**
     * @brief Close a module
     * @param moduleName Name of the module to close
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public closeModule(moduleName: string, skipNotify: boolean = false) {
        this.activeModules.get(moduleName)?.closeModule(true);
        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    /**
     * @brief Get a list of all modules
     * @returns List of all modules
     */
    public getAllModules(): string[] {
        return this.allModules;
    }

    /**
     * @brief Get a map of active modules
     * @returns Map of active modules
     */
    public getActiveModules(): Map<string, OverfloatModule> {
        return this.activeModules;
    }

    /**
     * @brief Get a list of inactive modules
     * @returns List of inactive modules
     */
    public getInactiveModules(): string[] {
        const inactive: string[] = this.allModules.filter(
            (item) => !this.activeModules.has(item)
        );
        return inactive;
    }

    /**
     * @brief Serialize all active modules
     * @returns List of serialized modules
     */
    async serializeActiveModules(): Promise<SerializedModule[]> {
        const activeModules: SerializedModule[] = [];

        for (const [_, module] of this.activeModules) {
            activeModules.push(await module.serializeModule());
        }

        return activeModules;
    }

    /**
     * @brief Save the active modules to a profile
     * @param profileName Name of the profile to save
     */
    public async saveProfile(profileName: string) {
        //Serialize the active modules and update the config
        this.profiles[profileName] = await this.serializeActiveModules();
        this.config["activeProfile"] = profileName;

        // Save the config and profiles
        await this.saveConfig();
        await this.saveProfiles();
    }

    /**
     * @brief Delete a profile
     * @param profileName Name of the profile to delete
     */
    public async deleteProfile(profileName: string) {
        // If the profile does not exist, return
        if (!(profileName in this.profiles)) return;
        delete this.profiles[profileName];

        // Update the config if the profile is active
        if (profileName == this.getActiveProfile()) {
            this.setActiveProfile("");
        }

        // Save the config and profiles
        await this.saveConfig();
        await this.saveProfiles();
        this.notifySubscribers();
    }

    /**
     * @brief Add a new profile
     * @param profileName Name of the profile to add
     */
    public async addProfile(profileName: string) {
        // If the profile name is empty, return
        if (profileName == "") return;

        // Save the profile
        await this.saveProfile(profileName);
        this.notifySubscribers();
    }

    /**
     * @brief Get a list of all profiles
     * @returns List of all profiles
     */
    public getProfiles(): string[] {
        return Object.keys(this.profiles);
    }

    /**
     * @brief Get the active profile
     * @returns Name of the active profile
     */
    public getActiveProfile(): string {
        return this.config["activeProfile"];
    }

    /**
     * @brief Set the active profile
     * @param profileName Name of the profile to set as active
     */
    public setActiveProfile(profileName: string) {
        this.config["activeProfile"] = profileName;
    }

    /**
     * @brief Dectivate a module
     * @param moduleName Name of the module to deactivate
     */
    public deactivateModule(moduleName: string) {
        this.activeModules.delete(moduleName);
        this.notifySubscribers();
    }
}
