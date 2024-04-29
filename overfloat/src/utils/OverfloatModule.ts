/*****************************************************************************
 * @FilePath    : src/utils/OverfloatModule.ts                               *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import {
    LogicalPosition,
    LogicalSize,
    WebviewWindow,
    appWindow,
} from "@tauri-apps/api/window";
import { SerializedShortcut, Shortcut } from "./Shortcut";
import { KeybindManager } from "./KeybindManager";
import { ModuleManager } from "./ModuleManager";

const _LOCAL_URL = "http://localhost:1420/module/";

// Interface for key-value pairs
export interface NameValuePairs {
    [key: string]: string | number;
}

// Type for window
export type Window = {
    webview: WebviewWindow;
    shortcuts: Map<string, Shortcut>;
    visible: boolean;
    transparent: boolean;
    createdPromise: Promise<void>;
    destroyedPromise: Promise<void>;
    savedKeybinds: Map<string, string[]>;
    params?: NameValuePairs;
    componentName?: string;
};

// Types for serialized window and module
type SerializedWindow = {
    title: string;
    isVisible: boolean;
    isTransparent: boolean;
    x: number;
    y: number;
    height: number;
    width: number;
    shortcuts: SerializedShortcut[];
    params?: NameValuePairs;
    componentName?: string;
};

export type SerializedModule = {
    moduleName: string;
    mainWindow: SerializedWindow;
    subwindows: SerializedWindow[];
};

/**
 * @brief Class representing a module with main window and subwindows
 * Includes subscribing for react components to listen for changes
 */
export class OverfloatModule {
    private moduleName: string;
    private subscribers: Set<Function>;

    private mainWindow: Window;
    private subwindows: Map<string, Window> = new Map<string, Window>();
    private subwindowsIds: Map<string, number> = new Map<string, number>();

    public subscribe(subscriber: Function): void {
        this.subscribers.add(subscriber);
    }

    public unsubscribe(subscriber: Function): void {
        this.subscribers.delete(subscriber);
    }

    public notifySubscribers(): void {
        for (const subscriber of this.subscribers) {
            subscriber();
        }
    }

    /**
     * @brief Constructor for OverfloatModule
     * @param moduleName Name of the module
     * @param title Title of the main window
     * @param visible Visibility of the main window
     * @param x X position of the main window
     * @param y Y position of the main window
     * @param height Height of the main window
     * @param width Width of the main window
     * @param savedShortcuts Saved shortcuts for the main window
     */
    public constructor(
        moduleName: string,
        title: string = moduleName,
        visible: boolean = true,
        x: number = 0,
        y: number = 0,
        height: number = 300,
        width: number = 500,
        savedShortcuts: SerializedShortcut[] = []
    ) {
        this.moduleName = moduleName;

        const windowLabel: string = "module/" + this.moduleName;
        const windowUrl: string = _LOCAL_URL + this.moduleName;

        // Create main window
        const webview = new WebviewWindow(windowLabel, {
            title: title,
            url: windowUrl,
            visible: visible,
            height: height,
            width: width,
            x: x,
            y: y,
            alwaysOnTop: true,
            decorations: false,
        });

        // Setup promises for window created and destroyed events
        let resolveCreated: () => void;
        const createdPromise = new Promise<void>((resolve) => {
            resolveCreated = resolve;
        });

        let resolveDestroyed: () => void;
        const destortedPromise = new Promise<void>((resolve) => {
            resolveDestroyed = resolve;
        });

        webview.once("tauri://created", () => resolveCreated());
        webview.once("tauri://close-requested", () => this.closeModule());
        webview.once("tauri://destroyed", () => resolveDestroyed());

        // Setup saved keybinds for the module
        const savedKeybinds = this.setupSavedKeybinds(savedShortcuts);

        // Setup main window
        this.mainWindow = {
            webview: webview,
            visible: visible,
            transparent: false,
            shortcuts: new Map<string, Shortcut>(),
            createdPromise: createdPromise,
            destroyedPromise: destortedPromise,
            savedKeybinds: savedKeybinds,
        };

        this.subscribers = new Set<Function>();
    }

    /**
     * @brief Shows the main window
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public async showMainWindow(skipNotify: boolean = false) {
        await this.mainWindow.webview.show();
        this.mainWindow.visible = true;
        if (!skipNotify) this.notifySubscribers();
    }

    /**
     * @brief Hides the main window
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public async hideMainWindow(skipNotify: boolean = false) {
        await this.mainWindow.webview.hide();
        this.mainWindow.visible = false;
        if (!skipNotify) this.notifySubscribers();
    }

    /**
     * @brief Parses name-value pairs into a query string
     * @param params Name-value pairs to be parsed
     * @returns Query string representation of the name-value pairs
     */
    private parseParams(params: NameValuePairs): string {
        let first: Boolean = true;
        let result: string = "";
        for (let key in params) {
            if (first) {
                result = "?" + key + "=" + params[key];
                first = false;
            } else {
                result = result + "&" + key + "=" + params[key];
            }
        }
        return result;
    }

    /**
     * @brief Opens a subwindow for the module
     * @param componentName Name of the component to be opened
     * @param title Title of the subwindow
     * @param params Name-value pairs to be passed to the component
     * @param visible Visibility of the subwindow
     * @param x X position of the subwindow
     * @param y Y position of the subwindow
     * @param height Height of the subwindow
     * @param width Width of the subwindow
     * @param skipNotify Skip notifying subscribers, used for batch operations
     * @param savedKeybinds Saved keybinds for the subwindow
     * @returns The opened subwindow
     */
    public async openSubwindow(
        componentName: string,
        title?: string,
        params: NameValuePairs = {},
        visible: boolean = true,
        transparent: boolean = false,
        x: number = 0,
        y: number = 0,
        height: number = 300,
        width: number = 500,
        skipNotify: boolean = false,
        savedKeybinds: Map<string, string[]> = new Map<string, string[]>()
    ): Promise<Window> {
        // Get the next id for the subwindow of this component
        let id: number | undefined = this.subwindowsIds.get(componentName);
        if (id == undefined) id = 0;
        else id = id + 1;

        // Get the query string for the params
        let paramsString: string = "";

        if (params !== undefined) {
            paramsString = this.parseParams(params);
        }

        const windowUrl =
            _LOCAL_URL + this.moduleName + "/" + componentName + paramsString;
        const windowLabel =
            "module/" + this.moduleName + "/" + componentName + "/" + id;

        // Create the subwindow
        const webview = new WebviewWindow(windowLabel, {
            title: title ? title : windowLabel,
            url: windowUrl,
            visible: visible,
            height: height,
            width: width,
            x: x,
            y: y,
            alwaysOnTop: true,
            transparent: transparent,
            decorations: false,
        });

        // Setup promises for window created and destroyed events
        let resolveCreated: () => void;
        const createdPromise = new Promise<void>((resolve) => {
            resolveCreated = resolve;
        });

        let resolveDestroyed: () => void;
        const destoryedPromise = new Promise<void>((resolve) => {
            resolveDestroyed = resolve;
        });

        webview.once("tauri://created", () => resolveCreated());
        webview.once("tauri://close-requested", () =>
            this.closeSubwindow(webview.label, true)
        );
        webview.once("tauri://destroyed", () => {
            this.notifySubscribers();
            resolveDestroyed();
        });

        // Setup the subwindow
        const window: Window = {
            webview: webview,
            shortcuts: new Map<string, Shortcut>(),
            visible: visible,
            transparent: transparent,
            createdPromise: createdPromise,
            destroyedPromise: destoryedPromise,
            params: params,
            componentName: componentName,
            savedKeybinds: savedKeybinds,
        };

        // Save the subwindow
        this.subwindows.set(windowLabel, window);
        this.subwindowsIds.set(componentName, id);

        await createdPromise.then();
        if (!skipNotify) this.notifySubscribers();
        return window;
    }

    /**
     * @brief Shows a subwindow
     * @param label Label of the webview window of the subwindow
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public async showSubwindow(label: string, skipNotify: boolean = false) {
        const window = this.subwindows.get(label);

        if (window == undefined) return;

        await window.webview.show();
        window.visible = true;
        if (!skipNotify) this.notifySubscribers();
    }

    /**
     * @brief Hides a subwindow
     * @param label Label of the webview window of the subwindow
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public async hideSubwindow(label: string, skipNotify: boolean = false) {
        const window = this.subwindows.get(label);
        if (window == undefined) return;

        await window.webview.hide();
        window.visible = false;

        if (!skipNotify) this.notifySubscribers();
    }

    /**
     * @brief Closes a subwindow
     * @param label Label of the webview window of the subwindow
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public async closeSubwindow(label: string, skipNotify: boolean = false) {
        // Get the subwindow
        const subwindow: Window | undefined = this.subwindows.get(label);
        if (subwindow == undefined) return;

        // Create the copy of the shortcuts
        const shortcuts: Map<string, Shortcut> = new Map<string, Shortcut>(
            subwindow.shortcuts
        );

        // Remove the shortcuts
        shortcuts.forEach((shortcut) => {
            KeybindManager.getInstance().removeShortcut(
                this.moduleName,
                shortcut.getWindowLabel(),
                shortcut.getId(),
                true
            );
        });

        // Close the subwindow and remove it from the map of subwindows
        this.subwindows.get(label)?.webview.emit("Overfloat://Close");
        this.subwindows.delete(label);

        await subwindow.destroyedPromise.then();
        if (!skipNotify) this.notifySubscribers();
    }

    /**
     * @brief Closes the module
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public async closeModule(skipNotify: boolean = false) {
        // Create the copy of the subwindows map
        const subwindows: Map<string, Window> = new Map<string, Window>(
            this.subwindows
        );

        // Prepare promises for the window destruction events
        const promises: Promise<void>[] = [];

        // Close all subwindows and add their destruction promises to the list
        subwindows.forEach((subwindow, label) => {
            promises.push(subwindow.destroyedPromise);
            this.closeSubwindow(label, true);
        });

        // Create the copy of the shortcuts of the main window
        const shortcuts: Map<string, Shortcut> = new Map<string, Shortcut>(
            this.mainWindow.shortcuts
        );

        // Remove the shortcuts of the main window
        shortcuts.forEach((shortcut) => {
            KeybindManager.getInstance().removeShortcut(
                this.moduleName,
                shortcut.getWindowLabel(),
                shortcut.getId(),
                true
            );
        });

        // Add the destruction promise of the main window to the list
        promises.push(this.mainWindow.destroyedPromise);

        // Close the main window
        this.mainWindow.webview.emit("Overfloat://Close");

        // Wait for all promises to resolve, then deactivate the module
        await Promise.all(promises).then(() => {
            ModuleManager.getInstance().deactivateModule(this.moduleName);
            if (!skipNotify) this.notifySubscribers();
        });
    }

    /**
     * @brief Gets the name of the module
     * @returns Name of the module
     */
    public getModuleName(): string {
        return this.moduleName;
    }

    /**
     * @brief Gets the main window of the module
     * @returns Main window of the module
     */
    public getMainWindow(): Window {
        return this.mainWindow;
    }

    /**
     * @brief Gets the subwindows of the module
     * @returns Map of subwindows of the module
     */
    public getSubwindows(): Map<string, Window> {
        return this.subwindows;
    }

    /**
     * @brief Checks if the window label is the main window label
     * @param windowLabel Label of the webview window
     * @returns true if the window label is the main window label, false otherwise
     */
    private isMainWindowLabel(windowLabel: string): boolean {
        return windowLabel == "module/" + this.moduleName;
    }

    /**
     * @brief Gets the suffix of the shortcut id, removing the module and window labels
     * @param id ID of the shortcut
     * @returns Suffix of the shortcut id
     */
    private getShortcutIdSuffix(id: string): string {
        return id.replace(/.*\/([^/]*)/g, "$1");
    }

    /**
     * @brief Adds a shortcut to a window of the module
     * @param windowLabel Label of the webview window
     * @param id ID of the shortcut
     * @param name Name of the shortcut
     * @param description Description of the shortcut
     * @param boundKeys Keys bound to the shortcut
     * @param skipNotify Skip notifying subscribers, used for batch operations
     * @returns The added shortcut
     */
    public addShortcut(
        windowLabel: string,
        id: string,
        name: string,
        description: string,
        boundKeys: string[] = [],
        skipNotify: boolean = false
    ): Shortcut | undefined {
        // Get the window
        let window: Window | undefined;
        if (this.isMainWindowLabel(windowLabel)) window = this.mainWindow;
        else window = this.subwindows.get(windowLabel);

        if (window == undefined) return;

        // Check if there were saved keybinds for this shortcut
        const savedKeybinds: string[] | undefined = window.savedKeybinds.get(
            this.getShortcutIdSuffix(id)
        );
        if (savedKeybinds) boundKeys = savedKeybinds;

        // Create the shortcut
        const shortcut: Shortcut = new Shortcut(
            name,
            windowLabel,
            id,
            description,
            boundKeys
        );

        // Add the shortcut to the window
        if (this.isMainWindowLabel(windowLabel)) {
            if (this.mainWindow.shortcuts.has(id)) return undefined;
            this.mainWindow.shortcuts.set(id, shortcut);
        } else {
            if (this.subwindows.get(windowLabel)?.shortcuts.has(id))
                return undefined;
            this.subwindows.get(windowLabel)?.shortcuts.set(id, shortcut);
        }

        if (!skipNotify) this.notifySubscribers();

        return shortcut;
    }

    /**
     * @brief Removes a shortcut from a window of the module
     * @param windowLabel Label of the webview window
     * @param id ID of the shortcut
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public removeShortcut(
        windowLabel: string,
        id: string,
        skipNotify: boolean = false
    ) {
        // Remove the shortcut from the window
        if (this.isMainWindowLabel(windowLabel)) {
            this.mainWindow.shortcuts.delete(id);
        } else {
            this.subwindows.get(windowLabel)?.shortcuts.delete(id);
        }

        if (!skipNotify) this.notifySubscribers();
    }

    /**
     * @brief Adds a keybind to a shortcut
     * @param windowLabel Label of the webview window
     * @param id ID of the shortcut
     * @param keybind Keybind to be added
     * @param skipNotify Skip notifying subscribers, used for batch operations
     */
    public addKeybind(
        windowLabel: string,
        id: string,
        keybind: string,
        skipNotify: boolean = false
    ) {
        let shortcut: Shortcut | undefined = undefined;

        // Get the shortcut
        if (this.isMainWindowLabel(windowLabel)) {
            shortcut = this.mainWindow.shortcuts.get(id);
        } else {
            shortcut = this.subwindows.get(windowLabel)?.shortcuts.get(id);
        }

        if (shortcut == undefined) return;

        // Add the keybind to the shortcut
        shortcut.addKeybind(keybind);

        if (!skipNotify) this.notifySubscribers();
        return shortcut;
    }

    /**
     * @brief Removes a keybind from a shortcut
     * @param windowLabel Label of the webview window
     * @param id ID of the shortcut
     * @param position Index of the keybind to be removed
     * @param skipNotify Skip notifying subscribers, used for batch operations
     * @returns The removed keybind
     */
    public removeKeybind(
        windowLabel: string,
        id: string,
        position: number,
        skipNotify: boolean = false
    ): string | undefined {
        let shortcut: Shortcut | undefined = undefined;

        // Get the shortcut
        if (this.isMainWindowLabel(windowLabel)) {
            shortcut = this.mainWindow.shortcuts.get(id);
        } else {
            shortcut = this.subwindows.get(windowLabel)?.shortcuts.get(id);
        }

        // Remove the keybind from the shortcut
        const removedKey: string | undefined =
            shortcut?.removeKeybind(position);

        if (!skipNotify) this.notifySubscribers();

        return removedKey;
    }

    /**
     * @brief Changes a keybind of a shortcut
     * @param windowLabel Label of the webview window
     * @param id ID of the shortcut
     * @param position Index of the keybind to be changed
     * @param keybind New keybind
     * @param skipNotify Skip notifying subscribers, used for batch operations
     * @returns Old keybind
     */
    public changeKeybind(
        windowLabel: string,
        id: string,
        position: number,
        keybind: string,
        skipNotify: boolean = false
    ): Shortcut | undefined {
        let shortcut: Shortcut | undefined = undefined;

        // get the shortcut
        if (this.isMainWindowLabel(windowLabel)) {
            shortcut = this.mainWindow.shortcuts.get(id);
        } else {
            shortcut = this.subwindows.get(windowLabel)?.shortcuts.get(id);
        }

        if (shortcut == undefined) return;

        // Change the keybind of the shortcut
        shortcut.changeKeybind(position, keybind);

        if (!skipNotify) this.notifySubscribers();
        return shortcut;
    }

    /**
     * @brief Gets the shortcuts of a window
     * @param windowLabel Label of the webview window
     * @returns Map of shortcuts of the window
     */
    public getWindowShortcuts(
        windowLabel: string
    ): Map<string, Shortcut> | undefined {
        if (this.isMainWindowLabel(windowLabel)) {
            return this.mainWindow.shortcuts;
        } else {
            return this.subwindows.get(windowLabel)?.shortcuts;
        }
    }

    /**
     * @brief Serializes a window
     * @param window Window to be serialized
     * @returns Serialized window
     */
    private async serializeWindow(window: Window): Promise<SerializedWindow> {
        // Get information about the window
        const title: string = await window.webview.title();
        const isVisible: boolean = await window.webview.isVisible();
        const scaleFactor: number = await appWindow.scaleFactor();

        const position: LogicalPosition = (
            await window.webview.outerPosition()
        ).toLogical(scaleFactor);

        const size: LogicalSize = (await window.webview.outerSize()).toLogical(
            scaleFactor
        );

        // Serialize the shortcuts of the window
        const shortcuts: SerializedShortcut[] = [];
        window.shortcuts.forEach((shortcut) => {
            shortcuts.push(shortcut.serializeShortcut());
        });

        // Return the serialized window
        return {
            title: title,
            isVisible: isVisible,
            isTransparent: window.transparent,
            x: position.x,
            y: position.y,
            height: size.height,
            width: size.width,
            shortcuts: shortcuts,
            params: window.params,
            componentName: window.componentName,
        };
    }

    /**
     * @brief Serializes the module
     * @returns Serialized module
     */
    async serializeModule(): Promise<SerializedModule> {
        // Serialize the main window
        const mainWindow: SerializedWindow = await this.serializeWindow(
            this.mainWindow
        );

        // Serialize the subwindows
        let subwindows: SerializedWindow[] = [];
        for (const [_, subwindow] of this.subwindows) {
            subwindows.push(await this.serializeWindow(subwindow));
        }

        // Return the serialized module
        return {
            moduleName: this.moduleName,
            mainWindow: mainWindow,
            subwindows: subwindows,
        };
    }

    /**
     * @brief Sets up saved keybinds for a window
     * @param serializedShortcuts Serialized shortcuts of the window
     * @returns Map of saved keybinds
     */
    private setupSavedKeybinds(
        serializedShortcuts: SerializedShortcut[]
    ): Map<string, string[]> {
        const savedKeybinds = new Map<string, string[]>();
        serializedShortcuts.forEach((serializedShortcut) => {
            savedKeybinds.set(
                serializedShortcut.id,
                serializedShortcut.keybinds
            );
        });

        return savedKeybinds;
    }

    /**
     * @brief Loads subwindows from a serialized module
     * @param serializedModule Serialized module to be loaded
     * @returns List of creation event promises of the visible windows
     */
    public loadSubwindows(
        serializedModule: SerializedModule
    ): Promise<Window>[] {
        // Prepare an array for Promieses of the creation events of the visible windows
        const promises: Promise<Window>[] = [];

        serializedModule.subwindows.forEach((serializedSubwindow) => {
            // Skip subwindows without a component name
            if (serializedSubwindow.componentName == undefined) return;

            // Setup saved keybinds for the subwindow
            const savedKeybinds = this.setupSavedKeybinds(
                serializedSubwindow.shortcuts
            );

            // Open the subwindow
            const window = this.openSubwindow(
                serializedSubwindow.componentName
                    ? serializedSubwindow.componentName
                    : "",
                serializedSubwindow.title,
                serializedSubwindow.params,
                false,
                serializedSubwindow.isTransparent,
                serializedSubwindow.x,
                serializedSubwindow.y,
                serializedSubwindow.height,
                serializedSubwindow.width,
                false,
                savedKeybinds
            );

            // If the subwindow is visible, add its creation event promise to the list
            if (serializedSubwindow.isVisible) promises.push(window);
        });

        return promises;
    }

    /**
     * @brief Checks if the module has shortcuts
     * @returns True if the module has shortcuts, false otherwise
     */
    public hasShortcuts(): boolean {
        if (this.mainWindow.shortcuts.size > 0) return true;
        for (const [_, subwindow] of this.subwindows) {
            if (subwindow.shortcuts.size > 0) return true;
        }

        return false;
    }
}
