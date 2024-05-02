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

export type { NameValuePairs, WindowSettings };

/**
 * @brief Function for opening a subwindow
 * @param subwindowName Name of the subwindow to be opened (the file name of the subwindow in ./subwindows without the extension)
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
    subwindowName: string,
    title?: string,
    parameters?: NameValuePairs,
    windowSettings?: WindowSettings
) {
    mainWindow()?.emit("Overfloat://SubwindowOpen", {
        subwindowName: subwindowName,
        title: title,
        params: parameters,
        windowSettings: windowSettings,
    });
}

/**
 * @brief Function for getting the value of a parameter from the URL
 * @param name Name of the parameter
 * @returns Value of the parameter or undefined if the parameter is not present
 */
export function getParameter(name: string): string | undefined {
    const value = new URLSearchParams(window.location.search).get(name);
    return value == null ? undefined : value;
}

/**
 * @brief Extracts the module name from the window label
 * @param windowLabel Window label
 * @returns Name of the module the window belongs to
 */
function getModuleName(windowLabel: string): string {
    const moduleName = windowLabel.replace(/module\/([^/]*)(\/.*)?/g, "$1");
    return moduleName;
}

/**
 * @brief Checks if the current window and the requested window are in the same module
 * @param label Window label of the requested window
 * @returns True if the windows are in the same module, false otherwise
 */
function moduleMatch(label: string) {
    const currentModule = getModuleName(appWindow.label);
    const requestedModule = getModuleName(label);

    return currentModule == requestedModule;
}

/**
 * @brief Function for showing a subwindow
 * @param label Label of the subwindow to be shown, default is the calling subwindow
 * @note Only subwindows from the same module can be shown this way
 */
function showSubwindow(label: string = appWindow.label) {
    if (!moduleMatch(label)) return;

    mainWindow()?.emit("Overfloat://SubwindowModification", {
        eventType: WindowEventType.Show,
        label: label,
    });
}

/**
 * @brief Function for hiding(minimizing) a subwindow
 * @param label Label of the subwindow to be hidden, default is the calling subwindow
 * @note Only subwindows from the same module can be hidden this way
 */
function hideSubwindow(label: string = appWindow.label) {
    if (!moduleMatch(label)) return;

    mainWindow()?.emit("Overfloat://SubwindowModification", {
        eventType: WindowEventType.Hide,
        label: label,
    });
    console.log("Hiding Subwindow: " + label);
}

/**
 * @brief Function for closing a subwindow
 * @param label Label of the subwindow to be closed, default is the calling subwindow
 * @note Only subwindows from the same module can be closed this way
 */
function closeSubwindow(label: string = appWindow.label) {
    if (!moduleMatch(label)) return;

    mainWindow()?.emit("Overfloat://SubwindowModification", {
        eventType: WindowEventType.Close,
        label: label,
    });
}

/**
 * @brief Function for checking whether the window is a subwindow
 * @returns true if the window is a subwindow, false otherwise
 * @param label Label of the window to be checked, default is the calling window
*/
function isSubwindow(label: string = appWindow.label) {

    const submodule = appWindow.label.replace(/module\/([^/]*)\/?(.*)?/g, "$2");
    return submodule.length != 0;
}

/**
 * @brief Function for checking whether the window is a main window
 * @returns true if the window is a main window, false otherwise
 * @param label Label of the window to be checked, default is the calling window
 */
function isMainWindow(label: string = appWindow.label) {
    const subLabel = appWindow.label.replace(/module\/(.*)/g, "$1");
    return subLabel.length == 0;
}

/**
 * @brief Function for hiding(minimalizing) a window
 * @param label Label of the window to be hidden, if not pressent the calling window will be hidden
 */
export function hideWindow(label?: string) {
    if(label != undefined) {
        if(isSubwindow(label)){
            hideSubwindow(label);
        }
        else if(isMainWindow(label) && moduleMatch(label)){
            hideMainWindow();
        }
        return;
    }

    if (isSubwindow()) {
        hideSubwindow();
    } else {
        hideMainWindow();
    }
}

/**
 * @brief Function for showing a window
 * @param label Label of the window to be shown, if not pressent the calling window will be shown
 */
export function showWindow(label?: string) {
    if(label != undefined) {
        if(isSubwindow(label)){
            showSubwindow(label);
        }
        else if(isMainWindow(label) && moduleMatch(label)){
            showMainWindow();
        }
        return;
    }

    if (isSubwindow()) {
        showSubwindow();
    } else {
        showMainWindow();
    }
}

/**
 * @brief Function for closing a window
 * @param label Label of the window to be closed, if not pressent the calling window will be closed
 * @note If the window is a main window, the whole module will be closed
 */
export function closeWindow(label?: string) {    
    if(label != undefined) {
        if(isSubwindow(label)){
            closeSubwindow(label);
        }
        else if(isMainWindow(label) && moduleMatch(label)){
            closeMainWindow();
        }
        return;
    }
    

    if (isSubwindow()) {
        closeSubwindow();
    } else {
        closeMainWindow();
    }
}
