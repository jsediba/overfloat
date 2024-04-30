/*****************************************************************************
 * @FilePath    : src/utils/WindowEventHandler.ts                            *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { listen } from "@tauri-apps/api/event";
import { ModuleManager } from "./ModuleManager";
import { NameValuePairs } from "./OverfloatModule";
import { WebviewWindow } from "@tauri-apps/api/window";

// Template for custom Tauri events
export type OverfloatEvent<T> = {
    event: string;
    windowLabel: string;
    payload: T;
    id: number;
};

// Types for different payloads used in custom OverfloatEvents(custom Tauri events)
export enum WindowEventType {
    Show,
    Hide,
    Close,
}

export type MainWindowEventPayload = {
    eventType: WindowEventType;
};

export type WindowSettings = {
    visible?: boolean;
    transparent?: boolean;
    height?: number;
    width?: number;
    x?: number;
    y?: number;
};

export type SubwindowOpenEventPayload = {
    subwindowName: string;
    title?: string;
    params?: NameValuePairs;
    windowSettings?: WindowSettings;
};

export type SubwindowModificationEventPayload = {
    eventType: WindowEventType;
    label: string;
};

/**
 * @brief Singleton class for handling window related events
 */
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

        // Listen for window related events from the API
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

    /**
     * @brief Extracts the module name from the window label
     * @param windowLabel Window label
     * @returns Name of the module the window belongs to
     */
    private getModuleName(windowLabel: string): string {
        const moduleName = windowLabel.replace(/module\/([^/]*)(\/.*)?/g, "$1");
        return moduleName;
    }

    /**
     * @brief Handles main window related events
     * @param event Event from the API
     */
    private mainWindowModification(
        event: OverfloatEvent<MainWindowEventPayload>
    ) {
        const module = this.moduleManager
            .getActiveModules()
            .get(this.getModuleName(event.windowLabel));
        switch (event.payload.eventType) {
            case WindowEventType.Show:
                module?.showMainWindow();
                break;
            case WindowEventType.Hide:
                module?.hideMainWindow();
                break;
            case WindowEventType.Close:
                this.moduleManager.closeModule(
                    this.getModuleName(event.windowLabel)
                );
                break;
        }
    }

    /**
     * @brief Handles subwindow open events
     * @param event Event from the API
     */
    private subwindowOpen(event: OverfloatEvent<SubwindowOpenEventPayload>) {
        const module = this.moduleManager
            .getActiveModules()
            .get(this.getModuleName(event.windowLabel));

        const windowSettings: WindowSettings =
            event.payload.windowSettings == undefined
                ? {}
                : event.payload.windowSettings;

        module?.openSubwindow(
            event.payload.subwindowName,
            event.payload.title,
            event.payload.params,
            windowSettings.visible,
            windowSettings.transparent,
            windowSettings.x,
            windowSettings.y,
            windowSettings.height,
            windowSettings.width,
        );
    }

    /**
     * @brief Handles subwindow modification events
     * @param event Event from the API
     */
    private subwindowModification(
        event: OverfloatEvent<SubwindowModificationEventPayload>
    ) {
        const module = this.moduleManager
            .getActiveModules()
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
                WebviewWindow.getByLabel(event.payload.label)?.emit(
                    "Overfloat://Close"
                );
                break;
        }
    }
}
