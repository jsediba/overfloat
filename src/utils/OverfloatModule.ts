import { WebviewWindow } from "@tauri-apps/api/window";

const _LOCAL_URL = "http://localhost:1420/module/";

export interface NameValuePairs {
    [key: string]: string | number;
}

export class OverfloatModule {
    private moduleName: string;
    private mainWindow: WebviewWindow | null = null;
    private subwindows: Map<string, WebviewWindow> = new Map<string, WebviewWindow>();
    private subwindowsIds: Map<string, number> = new Map<string, number>();
    private subscribers: Set<Function>;

    public constructor(moduleName: string) {
        this.moduleName = moduleName;
        this.subscribers = new Set<Function>();
        console.log("Creating new module " + moduleName);

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

    public showMainWindow(title?: string) {
        if (this.mainWindow == null) {
            const windowTitle = title === undefined ? this.moduleName : title;
            const windowLabel: string = "module/" + this.moduleName;
            const windowUrl: string = _LOCAL_URL + this.moduleName;
            this.mainWindow = new WebviewWindow(windowLabel, {
                title: windowTitle,
                url: windowUrl,
                visible: true,
                height: 300,
                width: 500,
                alwaysOnTop: true,
                decorations: true,
            });
            this.mainWindow.once("tauri://destroyed", () => {
                this.mainWindow = null;
                this.notifySubscribers();
            });
        } else {
            this.mainWindow.show();
        }

        this.notifySubscribers();
    }

    public hideMainWindow() {
        if (this.mainWindow == null) {
            return;
        }

        this.mainWindow.hide();

        this.notifySubscribers();
    }

    public closeMainWindow() {
        if (this.mainWindow == null) {
            return;
        }

        this.mainWindow.close();
        this.mainWindow = null;

        this.notifySubscribers();
    }

    public openSubwindow(component_name: string, title?: string, params?: NameValuePairs) {
        console.log("Subwindow open started");

        let id: number;
        if (this.subwindowsIds.has(component_name)) {
            // @ts-expect-error
            id = this.subwindowsIds.get(component_name) + 1;
        } else {
            id = 0;
        }

        let paramsString: string = "";

        if (params !== undefined) {
            paramsString = this.parseParams(params);
        }

        const windowUrl = _LOCAL_URL + this.moduleName + "/" + component_name + paramsString;
        const windowLabel = "module/" + this.moduleName + "/" + component_name + "_" + id;
        const windowTitle = title === undefined ? windowLabel : title;
        const webview = new WebviewWindow(windowLabel, {
            title: windowTitle,
            url: windowUrl,
            visible: true,
            height: 300,
            width: 500,
            alwaysOnTop: true,
            decorations: true,
        });

        webview.once("tauri://destroyed", () => {
            this.subwindows.delete(windowLabel);
            this.notifySubscribers();
        });

        this.subwindows.set(windowLabel, webview);
        this.subwindowsIds.set(component_name, id);

        console.log("After opening size is:" + this.subwindows.size);
        this.notifySubscribers();
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

    public showSubwindow(label: string) {
        if (!this.subwindows.has(label)) {
            return;
        }

        this.subwindows.get(label)?.show();

        this.notifySubscribers();
    }

    public hideSubwindow(label: string) {
        if (!this.subwindows.has(label)) {
            return;
        }

        this.subwindows.get(label)?.hide();

        this.notifySubscribers();
    }

    public closeSubwindow(label: string) {
        if (!this.subwindows.has(label)) {
            return;
        }

        this.subwindows.get(label)?.close();
        this.subwindows.delete(label);

        this.notifySubscribers();
    }

    public getMainWindow(): WebviewWindow | null {
        return this.mainWindow;
    }

    public getSubwindows(): Map<string, WebviewWindow> {
        return this.subwindows;
    }
}
