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
    type: WindowEventType;
    sourceModule: string;
};

export type SubwindowModificationEventPayload = {
    type: WindowEventType;
    sourceModule: string;
    label: string;
};

export type SubwindowOpenEventPayload = {
    sourceModule: string;
    componentName: string;
    title?: string;
    params?: NameValuePairs;
};

export class EventHandler {
    private static instance: EventHandler;
    private modules: Map<string, OverfloatModule>;

    public static getInstance(): EventHandler {
        if (!this.instance) {
            console.log("Creating new EventHandler");
            this.instance = new EventHandler();
        }

        return this.instance;
    }

    private constructor() {
        this.modules = ModuleManager.getInstance().getModules();
        ModuleManager.getInstance().subscribe(this.updateModules);

        listen("Overfloat://MainWindowModification", (event: OverfloatEvent<MainWindowEventPayload>) => this.mainWindowModification(event));
        listen("Overfloat://SubwindowModification", (event: OverfloatEvent<SubwindowModificationEventPayload>) => this.subwindowModification(event));
        listen("Overfloat://SubwindowOpen", (event: OverfloatEvent<SubwindowOpenEventPayload>) => this.subwindowOpen(event));
    }

    private updateModules() {
        this.modules = ModuleManager.getInstance().getModules();
    }

    private mainWindowModification(event: OverfloatEvent<MainWindowEventPayload>) {
        const module = this.modules.get(event.payload.sourceModule);
        switch (event.payload.type) {
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
        const module = this.modules.get(event.payload.sourceModule);

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
        const module = this.modules.get(event.payload.sourceModule);
        module?.openSubwindow(event.payload.componentName, event.payload.title, event.payload.params);
    }
}
