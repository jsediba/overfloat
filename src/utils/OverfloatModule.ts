import {
    LogicalPosition,
    LogicalSize,
    WebviewWindow,
    appWindow,
} from "@tauri-apps/api/window";
import { SerializedShortcut, Shortcut } from "./Shortcut";
import { KeybindManager } from "./KeybindManager";

const _LOCAL_URL = "http://localhost:1420/module/";

export interface NameValuePairs {
    [key: string]: string | number;
}

export type Window = {
    webview: WebviewWindow;
    shortcuts: Map<string, Shortcut>;
    visible: boolean;
    createdPromise: Promise<void>;
    destroyedPromise: Promise<void>;
    params?: NameValuePairs;
    componentName?: string;
};

type SerializedWindow = {
    title: string;
    isVisible: boolean;
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

    public constructor(
        moduleName: string,
        title: string = moduleName,
        visible: boolean = true,
        x: number = 0,
        y: number = 0,
        height: number = 300,
        width: number = 500
    ) {
        this.moduleName = moduleName;

        const windowLabel: string = "module/" + this.moduleName;
        const windowUrl: string = _LOCAL_URL + this.moduleName;

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

        let resolveCreated: () => void;
        const createdPromise = new Promise<void>((resolve) => {
            resolveCreated = resolve;
        });

        let resolveDestroyed: () => void;
        const destortedPromise = new Promise<void>((resolve) => {
            resolveDestroyed = resolve;
        });

        webview.once("tauri://created", () => resolveCreated());
        webview.once("tauri://destroyed", () => resolveDestroyed());

        this.mainWindow = {
            webview: webview,
            visible: visible,
            shortcuts: new Map<string, Shortcut>(),
            createdPromise: createdPromise,
            destroyedPromise: destortedPromise,
        };

        this.subscribers = new Set<Function>();
    }

    public async showMainWindow(skipNotify: boolean = false) {
        await this.mainWindow.webview.show();
        this.mainWindow.visible = true;
        if (!skipNotify) this.notifySubscribers();
    }

    public async hideMainWindow(skipNotify: boolean = false) {
        await this.mainWindow.webview.hide();
        this.mainWindow.visible = false;
        if (!skipNotify) this.notifySubscribers();
    }

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

    public async openSubwindow(
        componentName: string,
        title?: string,
        params: NameValuePairs = {},
        visible: boolean = true,
        x: number = 0,
        y: number = 0,
        height: number = 300,
        width: number = 500,
        skipNotify: boolean = false
    ): Promise<Window> {
        let id: number;
        if (this.subwindowsIds.has(componentName)) {
            // @ts-expect-error
            id = this.subwindowsIds.get(componentName) + 1;
        } else {
            id = 0;
        }

        let paramsString: string = "";

        if (params !== undefined) {
            paramsString = this.parseParams(params);
        }

        const windowUrl =
            _LOCAL_URL + this.moduleName + "/" + componentName + paramsString;
        const windowLabel =
            "module/" + this.moduleName + "/" + componentName + "/" + id;

        const webview = new WebviewWindow(windowLabel, {
            title: title ? title : windowLabel,
            url: windowUrl,
            visible: visible,
            height: height,
            width: width,
            x: x,
            y: y,
            alwaysOnTop: true,
            decorations: false,
        });

        let resolveCreated: () => void;
        const createdPromise = new Promise<void>((resolve) => {
            resolveCreated = resolve;
        });

        let resolveDestroyed: () => void;
        const destoryedPromise = new Promise<void>((resolve) => {
            resolveDestroyed = resolve;
        });

        webview.once("tauri://created", () => resolveCreated());
        webview.once("tauri://destroyed", () => {
            this.notifySubscribers();
            resolveDestroyed();
        });

        const window: Window = {
            webview: webview,
            shortcuts: new Map<string, Shortcut>(),
            visible: visible,
            createdPromise: createdPromise,
            destroyedPromise: destoryedPromise,
            params: params,
            componentName: componentName,
        };

        this.subwindows.set(windowLabel, window);
        this.subwindowsIds.set(componentName, id);

        await createdPromise.then();
        if (!skipNotify) this.notifySubscribers();
        return window;
    }

    public async showSubwindow(label: string, skipNotify: boolean = false) {
        const window = this.subwindows.get(label);

        if (window == undefined) return;

        await window.webview.show();
        window.visible = true;
        if (!skipNotify) this.notifySubscribers();
    }

    public async hideSubwindow(label: string, skipNotify: boolean = false) {
        const window = this.subwindows.get(label);
        if (window == undefined) return;

        await window.webview.hide();
        window.visible = false;

        if (!skipNotify) this.notifySubscribers();
    }

    public async closeSubwindow(label: string, skipNotify: boolean = false) {
        const subwindow: Window | undefined = this.subwindows.get(label);
        if (subwindow == undefined) return;

        const shortcuts: Map<string, Shortcut> = new Map<string, Shortcut>(
            subwindow.shortcuts
        );

        shortcuts.forEach((shortcut) => {
            KeybindManager.getInstance().removeShortcut(
                this.moduleName,
                shortcut.getWindowLabel(),
                shortcut.getId(),
                true
            );
        });

        this.subwindows.get(label)?.webview.emit("Overfloat://Close");
        this.subwindows.delete(label);

        await subwindow.destroyedPromise.then();
        if (!skipNotify) this.notifySubscribers();
    }

    public async closeModule(skipNotify: boolean = false) {
        const subwindows: Map<string, Window> = new Map<string, Window>(
            this.subwindows
        );

        const promises: Promise<void>[] = [];

        subwindows.forEach((subwindow, label) => {
            promises.push(subwindow.destroyedPromise);
            this.closeSubwindow(label, true);
        });

        const shortcuts: Map<string, Shortcut> = new Map<string, Shortcut>(
            this.mainWindow.shortcuts
        );
        shortcuts.forEach((shortcut) => {
            KeybindManager.getInstance().removeShortcut(
                this.moduleName,
                shortcut.getWindowLabel(),
                shortcut.getId(),
                true
            );
        });

        promises.push(this.mainWindow.destroyedPromise);
        this.mainWindow.webview.emit("Overfloat://Close");
        await Promise.all(promises).then();
        if (!skipNotify) this.notifySubscribers();
    }

    public getModuleName(): string {
        return this.moduleName;
    }

    public getMainWindow(): Window {
        return this.mainWindow;
    }

    public getSubwindows(): Map<string, Window> {
        return this.subwindows;
    }

    private isMainWindowLabel(windowLabel: string): boolean {
        return windowLabel == "module/" + this.moduleName;
    }

    public addShortcut(
        windowLabel: string,
        id: string,
        name: string,
        description: string,
        boundKeys: string[] = [],
        skipNotify: boolean = false
    ): Shortcut | undefined {
        const shortcut: Shortcut = new Shortcut(
            name,
            windowLabel,
            id,
            description,
            boundKeys
        );

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

    public removeShortcut(
        windowLabel: string,
        id: string,
        skipNotify: boolean = false
    ) {
        if (this.isMainWindowLabel(windowLabel)) {
            this.mainWindow.shortcuts.delete(id);
        } else {
            this.subwindows.get(windowLabel)?.shortcuts.delete(id);
        }

        if (!skipNotify) this.notifySubscribers();
    }

    public addKeybind(
        windowLabel: string,
        id: string,
        keybind: string,
        skipNotify: boolean = false
    ) {
        let shortcut: Shortcut | undefined = undefined;

        if (this.isMainWindowLabel(windowLabel)) {
            shortcut = this.mainWindow.shortcuts.get(id);
        } else {
            shortcut = this.subwindows.get(windowLabel)?.shortcuts.get(id);
        }

        if (shortcut == undefined) return;

        shortcut.addKeybind(keybind);

        if (!skipNotify) this.notifySubscribers();
        return shortcut;
    }

    public removeKeybind(
        windowLabel: string,
        id: string,
        position: number,
        skipNotify: boolean = false
    ): string | undefined {
        let shortcut: Shortcut | undefined = undefined;

        if (this.isMainWindowLabel(windowLabel)) {
            shortcut = this.mainWindow.shortcuts.get(id);
        } else {
            shortcut = this.subwindows.get(windowLabel)?.shortcuts.get(id);
        }

        const removedKey: string | undefined =
            shortcut?.removeKeybind(position);

        if (!skipNotify) this.notifySubscribers();

        return removedKey;
    }

    public changeKeybind(
        windowLabel: string,
        id: string,
        position: number,
        keybind: string,
        skipNotify: boolean = false
    ): Shortcut | undefined {
        let shortcut: Shortcut | undefined = undefined;

        if (this.isMainWindowLabel(windowLabel)) {
            shortcut = this.mainWindow.shortcuts.get(id);
        } else {
            shortcut = this.subwindows.get(windowLabel)?.shortcuts.get(id);
        }

        if (shortcut != undefined) shortcut.changeKeybind(position, keybind);

        if (!skipNotify) this.notifySubscribers();
        return shortcut;
    }

    public getWindowShortcuts(
        windowLabel: string
    ): Map<string, Shortcut> | undefined {
        if (this.isMainWindowLabel(windowLabel)) {
            return this.mainWindow.shortcuts;
        } else {
            return this.subwindows.get(windowLabel)?.shortcuts;
        }
    }

    private async serializeWindow(window: Window): Promise<SerializedWindow> {
        const title: string = await window.webview.title();
        const isVisible: boolean = await window.webview.isVisible();

        const scaleFactor: number = await appWindow.scaleFactor();

        const position: LogicalPosition = (
            await window.webview.outerPosition()
        ).toLogical(scaleFactor);
        const size: LogicalSize = (await window.webview.outerSize()).toLogical(
            scaleFactor
        );
        const shortcuts: SerializedShortcut[] = [];
        window.shortcuts.forEach((shortcut) => {
            shortcuts.push(shortcut.serializeShortcut());
        });

        return {
            title: title,
            isVisible: isVisible,
            x: position.x,
            y: position.y,
            height: size.height,
            width: size.width,
            shortcuts: shortcuts,
            params: window.params,
            componentName: window.componentName,
        };
    }

    async serializeModule(): Promise<SerializedModule> {
        const mainWindow: SerializedWindow = await this.serializeWindow(
            this.mainWindow
        );

        let subwindows: SerializedWindow[] = [];

        for (const [_, subwindow] of this.subwindows) {
            subwindows.push(await this.serializeWindow(subwindow));
        }

        return {
            moduleName: this.moduleName,
            mainWindow: mainWindow,
            subwindows: subwindows,
        };
    }

    async setupShortcuts(
        window: Window,
        serializedShortcuts: SerializedShortcut[]
    ) {
        await window.createdPromise.then();
        serializedShortcuts.forEach((shortcut) => {
            KeybindManager.getInstance().removeAllKeybinds(
                this.moduleName,
                window.webview.label,
                shortcut.id,
                true
            );
            shortcut.keybinds.forEach((keybind) => {
                KeybindManager.getInstance().addKeybind(
                    this.moduleName,
                    window.webview.label,
                    shortcut.id,
                    keybind,
                    true
                );
            });
        });
    }

    public loadModule(serializedModule: SerializedModule): Promise<Window>[] {
        this.setupShortcuts(
            this.mainWindow,
            serializedModule.mainWindow.shortcuts
        );

        const promises: Promise<Window>[] = [];

        serializedModule.subwindows.forEach((serializedSubwindow) => {
            const window = this.openSubwindow(
                serializedSubwindow.componentName
                    ? serializedSubwindow.componentName
                    : "",
                serializedSubwindow.title,
                serializedSubwindow.params,
                false,
                serializedSubwindow.x,
                serializedSubwindow.y,
                serializedSubwindow.height,
                serializedSubwindow.width
            );

            if (serializedSubwindow.isVisible) promises.push(window);

            window.then((window) =>
                this.setupShortcuts(window, serializedSubwindow.shortcuts)
            );
        });

        return promises;
    }
}
