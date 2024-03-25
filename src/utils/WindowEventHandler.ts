import { listen } from "@tauri-apps/api/event";
import { ModuleManager } from "./ModuleManager";
import { NameValuePairs, OverfloatModule } from "./OverfloatModule";

export type OverfloatEvent<T> = {
    event: string;
    windowLabel: string;
    payload: T;
    id: number;
};

export enum WindowEventType {
    Show,
    Hide,
    Close,
}

export type MainWindowEventPayload = {
    eventType: WindowEventType;
};

export type SubwindowModificationEventPayload = {
    type: WindowEventType;
    label: string;
};

export type SubwindowOpenEventPayload = {
    componentName: string;
    title?: string;
    params?: NameValuePairs;
};

export class WindowEventHandler {
    private static instance: WindowEventHandler;
    private modules: Map<string, OverfloatModule>;

    public static getInstance(): WindowEventHandler {
        if (!this.instance) {
            console.log("Creating new WindowEventHandler");
            this.instance = new WindowEventHandler();
        }

        return this.instance;
    }

    private constructor() {
        this.modules = ModuleManager.getModules();
        ModuleManager.subscribe(this.updateModules);

        listen("Overfloat://MainWindowModification", (event: OverfloatEvent<MainWindowEventPayload>) => this.mainWindowModification(event));
        listen("Overfloat://SubwindowModification", (event: OverfloatEvent<SubwindowModificationEventPayload>) => this.subwindowModification(event));
        listen("Overfloat://SubwindowOpen", (event: OverfloatEvent<SubwindowOpenEventPayload>) => this.subwindowOpen(event));
    }

    private updateModules() {
        this.modules = ModuleManager.getModules();
    }

    private getModuleName(windowLabel: string):string {
        const moduleName = windowLabel.replace(/module\/([^/]*)(\/.*)?/g, '$1');
        return moduleName
    }

    private mainWindowModification(event: OverfloatEvent<MainWindowEventPayload>) {
        console.log(event);
        const module = this.modules.get(this.getModuleName(event.windowLabel));
        switch (event.payload.eventType) {
            case WindowEventType.Show:
                module?.showMainWindow();
                break;
            case WindowEventType.Hide:
                module?.hideMainWindow();
                break;
            case WindowEventType.Close:
                module?.closeMainWindow();
                break;
        }
    }

    private subwindowModification(event: OverfloatEvent<SubwindowModificationEventPayload>) {
        const module = this.modules.get(this.getModuleName(event.windowLabel));

        switch (event.payload.type) {
            case WindowEventType.Show:
                module?.showSubwindow(event.payload.label);
                break;
            case WindowEventType.Hide:
                module?.hideSubwindow(event.payload.label);
                break;
            case WindowEventType.Close:
                module?.closeSubwindow(event.payload.label);
                break;
        }
    }

    private subwindowOpen(event: OverfloatEvent<SubwindowOpenEventPayload>) {
        const module = this.modules.get(this.getModuleName(event.windowLabel));
        module?.openSubwindow(event.payload.componentName, event.payload.title, event.payload.params);
    }
}
