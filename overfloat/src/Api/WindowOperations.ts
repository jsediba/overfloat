/*****************************************************************************
 * @FilePath    : src/Api/WindowOperations.ts                                *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { WebviewWindow, appWindow } from "@tauri-apps/api/window";
import { WindowEventType, WindowSettings } from "../utils/WindowEventHandler";
import { NameValuePairs } from "../utils/OverfloatModule";

/**
 * @brief Function for getting the main window of the application
 * @returns WebviewWindow object representing the main window
 */
function mainWindow() {
    return WebviewWindow.getByLabel("Overfloat");
}

/**
 * @brief Function for showing the main window of the module
 */
export function showMainWindow() {
    mainWindow()?.emit("Overfloat://MainWindowModification", {
        eventType: WindowEventType.Show,
    });
}

/**
 * @brief Function for hiding(minimalizing) the main window of the module
 */
export function hideMainWindow() {
    mainWindow()?.emit("Overfloat://MainWindowModification", {
        eventType: WindowEventType.Hide,
    });
}

/**
 * @brief Function for closing the main window of the module, this closes the whole module
 */
export function closeMainWindow() {
    mainWindow()?.emit("Overfloat://MainWindowModification", {
        eventType: WindowEventType.Close,
    });
}

/**
 * @brief Function for opening a subwindow
 * @param componentName Name of the component to be opened (the file name of the component in ./subwindows without the extension) 
 * @param title Title to be displayed in the subwindow
 * @param parameters Name-value pairs to be passed to the subwindow in the URL
 * @param windowSettings Settings object for the subwindow, it includes the following optional fields:
 * @param windowSettings.visible Visibility of the subwindow
 * @param windowSettings.transparent Transparency of the subwindow
 * @param windowSettings.x X position of the subwindow
 * @param windowSettings.y Y position of the subwindow
 * @param windowSettings.height Height of the subwindow
 * @param windowSettings.width Width of the subwindow
 */
export function openSubwindow(
    componentName: string,
    title?: string,
    parameters?: NameValuePairs,
    windowSettings?: WindowSettings
) {
    mainWindow()?.emit("Overfloat://SubwindowOpen", {
        componentName: componentName,
        title: title,
        params: parameters,
        windowSettings: windowSettings,
    });
}

/**
 * @brief Function for showing a subwindow
 * @param label Label of the subwindow to be shown, default is the calling subwindow
 */
export function showSubwindow(label: string = appWindow.label) {
    mainWindow()?.emit("Overfloat://SubwindowModification", {
        eventType: WindowEventType.Show,
        label: label,
    });
}

/**
 * @brief Function for getting the value of a parameter from the URL
 * @param name Name of the parameter
 * @returns Value of the parameter or undefined if the parameter is not present
 */
export function getParameter(name: string): string|undefined {
    const value = new URLSearchParams(window.location.search).get(name);
    return value == null ? undefined : value;
}

/**
 * @brief Function for hiding(minimizing) a subwindow
 * @param label Label of the subwindow to be hidden, default is the calling subwindow
 */
export function hideSubwindow(label: string = appWindow.label) {
    mainWindow()?.emit("Overfloat://SubwindowModification", {
        eventType: WindowEventType.Hide,
        label: label,
    });
    console.log("Hiding Subwindow: " + label);
}

/**
 * @brief Function for closing a subwindow
 * @param label Label of the subwindow to be closed, default is the calling subwindow
 */
export function closeSubwindow(label: string = appWindow.label) {
    mainWindow()?.emit("Overfloat://SubwindowModification", {
        eventType: WindowEventType.Close,
        label: label,
    });
}