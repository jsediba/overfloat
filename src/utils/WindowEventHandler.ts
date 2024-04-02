import { listen } from "@tauri-apps/api/event";
import { ModuleManager } from "./ModuleManager";
import { NameValuePairs } from "./OverfloatModule";
import { WebviewWindow } from "@tauri-apps/api/window";

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

export type SubwindowOpenEventPayload = {
    componentName: string;
    title?: string;
    params?: NameValuePairs;
};

export type SubwindowModificationEventPayload = {
    eventType: WindowEventType;
    label: string;
};

export class WindowEventHandler {
    private static instance: WindowEventHandler;
    private moduleManager: ModuleManager;

    public static getInstance(): WindowEventHandler {
        if (!WindowEventHandler.instance) {
            WindowEventHandler.instance = new WindowEventHandler();
        }

        return WindowEventHandler.instance;
    }

    private constructor() {
        this.moduleManager = ModuleManager.getInstance();
        listen(
            "Overfloat://MainWindowModification",
            (event: OverfloatEvent<MainWindowEventPayload>) =>
                this.mainWindowModification(event)
        );
        listen(
            "Overfloat://SubwindowOpen",
            (event: OverfloatEvent<SubwindowOpenEventPayload>) =>
                this.subwindowOpen(event)
        );
        listen(
            "Overfloat://SubwindowModification",
            (event: OverfloatEvent<SubwindowModificationEventPayload>) =>
                this.subwindowModification(event)
        );
    }

    private getModuleName(windowLabel: string): string {
        const moduleName = windowLabel.replace(/module\/([^/]*)(\/.*)?/g, "$1");
        return moduleName;
    }

    private mainWindowModification(
        event: OverfloatEvent<MainWindowEventPayload>
    ) {
        const module = this.moduleManager
            .getModules()
            .get(this.getModuleName(event.windowLabel));
        switch (event.payload.eventType) {
            case WindowEventType.Show:
                module?.showMainWindow();
                break;
            case WindowEventType.Hide:
                module?.hideMainWindow();
                break;
            case WindowEventType.Close:
                module?.closeMainWindow();
                WebviewWindow.getByLabel(event.windowLabel)?.emit("Overfloat://Close");
                break;
        }
    }

    private subwindowOpen(event: OverfloatEvent<SubwindowOpenEventPayload>) {
        const module = this.moduleManager
            .getModules()
            .get(this.getModuleName(event.windowLabel));
        module?.openSubwindow(
            event.payload.componentName,
            event.payload.title,
            event.payload.params
        );
    }

    private subwindowModification(
        event: OverfloatEvent<SubwindowModificationEventPayload>
    ) {
        const module = this.moduleManager
            .getModules()
            .get(this.getModuleName(event.windowLabel));

        switch (event.payload.eventType) {
            case WindowEventType.Show:
                module?.showSubwindow(event.payload.label);
                break;
            case WindowEventType.Hide:
                module?.hideSubwindow(event.payload.label);
                break;
            case WindowEventType.Close:
                module?.closeSubwindow(event.payload.label);
                WebviewWindow.getByLabel(event.payload.label)?.emit("Overfloat://Close");
                break;
        }
    }
}
