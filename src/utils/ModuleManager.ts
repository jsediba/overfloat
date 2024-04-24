import { OverfloatModule, SerializedModule, Window } from "./OverfloatModule";
import { invoke } from "@tauri-apps/api";
import { SerializedShortcut } from "./Shortcut";

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

    async initialLoad() {
        await this.setupModules();
        await this.loadProfiles();
        await this.loadConfig();
        this.loadProfile(this.config["activeProfile"]);
        this.notifySubscribers();
    }

    async loadConfig() {
        const configString: string = await invoke<string>("get_config");
        try {
            this.config = JSON.parse(configString);
        } catch {
            this.config = { activeProfile: "" };
            this.saveConfig();
        }
    }

    async saveConfig() {
        await invoke("save_config", {
            configJson: JSON.stringify(this.config, null, "\t"),
        });
    }

    async saveProfiles() {
        await invoke("save_profiles", {
            profilesJson: JSON.stringify(this.profiles, null, "\t"),
        });
    }

    async loadProfiles() {
        const profilesString: string = await invoke<string>("get_profiles");
        try {
            this.profiles = JSON.parse(profilesString);
        } catch (_) {
            this.profiles = {};
            this.saveProfiles();
        }
    }

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

        await Promise.all(promises).then(() => { });
        if (!skipNotify) {
            this.notifySubscribers();
        }
    }


    async loadProfile(profileName: string) {
        if (!(profileName in this.profiles)) {
            return
        };

        await this.closeAllModules();

        const profile: SerializedModule[] = this.profiles[profileName];

        const promises: Promise<Window>[] = [];

        profile.forEach((serializedModule) => {
            if(!this.allModules.includes(serializedModule.moduleName)) return;
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


            if (serializedModule.mainWindow.isVisible) {
                const promise: Promise<Window> = new Promise<Window>(resolve => { resolve(module.getMainWindow()) });
                promises.push(promise);
            }
            promises.push(...module.loadModule(serializedModule));
        });

        this.config["activeProfile"] = profileName;
        this.saveConfig();

        Promise.all(promises).then((windows: Window[]) => {
            windows.forEach((window) => { window.webview.show(); window.visible = true });
            this.activeModules.forEach((module) => module.notifySubscribers())
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

    private async setupModules() {
        let module_names: string[] = await invoke("get_module_names");
        this.activeModules = new Map<string, OverfloatModule>();
        this.allModules = module_names;
    }

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

        const activeModule = this.activeModules.get(moduleName);
        if (activeModule != undefined) return activeModule;


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

    public closeModule(moduleName: string, skipNotify: boolean = false) {
        this.activeModules.get(moduleName)?.closeModule(true);
        if (!skipNotify) {
            this.notifySubscribers();
        }
    }

    public getAllModules(): string[] {
        return this.allModules;
    }

    public getActiveModules(): Map<string, OverfloatModule> {
        return this.activeModules;
    }

    public getInactiveModules(): string[] {
        const inactive: string[] = this.allModules.filter(
            (item) => !this.activeModules.has(item)
        );
        return inactive;
    }

    async serializeActiveModules(): Promise<SerializedModule[]> {
        const activeModules: SerializedModule[] = [];

        for (const [_, module] of this.activeModules) {
            activeModules.push(await module.serializeModule());
        }

        return activeModules;
    }

    public async saveProfile(profileName: string) {
        this.profiles[profileName] = await this.serializeActiveModules();
        this.config["activeProfile"] = profileName;
        this.saveConfig();
        this.saveProfiles();
    }

    public async deleteProfile(profileName: string) {
        if (!(profileName in this.profiles)) return;
        delete this.profiles[profileName]
        if (profileName == this.getActiveProfile()) {
            this.setActiveProfile("");
        }
        await this.saveProfiles();
        await this.saveConfig();
        this.notifySubscribers();
    }

    public async addProfile(profileName: string){
        if(profileName == "") return;
        await this.saveProfile(profileName);
        this.notifySubscribers();
    }

    public getProfiles(): string[] {
        return Object.keys(this.profiles);
    }

    public getActiveProfile(): string {
        return this.config["activeProfile"];
    }

    public setActiveProfile(profileName: string) {
        this.config["activeProfile"] = profileName;
    }

    public deactivateModule(moduleName: string) {
        this.activeModules.delete(moduleName);
        this.notifySubscribers();
    }


}

type SerializedProfiles = {
    [profileName: string]: SerializedModule[];
};

type SerializedConfig = {
    [key: string]: string;
};
