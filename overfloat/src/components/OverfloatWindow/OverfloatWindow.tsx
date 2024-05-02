/*****************************************************************************
 * @FilePath    : src/components/OverfloatWindow/OverfloatWindow.tsx         *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useState, useEffect } from "react";
import useStateRef from "react-usestateref";
import { OverfloatModule } from "../../utils/OverfloatModule";
import { ModuleManager } from "../../utils/ModuleManager";
import { WindowEventHandler } from "../../utils/WindowEventHandler";
import { KeybindManager } from "../../utils/KeybindManager";
import { KeybindEventHandler } from "../../utils/KeybindEventHandler";
import "./css/OverfloatWindow.css";
import { PhysicalSize, appWindow } from "@tauri-apps/api/window";
import OverfloatTitleBar from "./OverfloatTitleBar";
import { createGlobalStyle } from "styled-components";
import TrayModule from "../Tray/TrayModule";
import ModuleSettings from "../Modules/ModuleSettings";
import ShortcutSettings from "../Shortcuts/ShortcutSettings";
import { invoke } from "@tauri-apps/api";
import { IconApps, IconKeyboard } from "@tabler/icons-react";

// Enum for the displayed submenu modes
enum Submenu {
    None,
    Modules,
    Shortcuts,
}

// Global style, to prevent white blinks when resizing, disable text selection and hide scrollbar
const GlobalStyle = createGlobalStyle`body{background-color: rgb(75,75,75);
    user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   -webkit-user-select: none;}
   ::-webkit-scrollbar {
    height: 100%;
    width: 0;
    background-color: transparent;
}`;

/**
 * React component for the main Overfloat window.
 */
const OverfloatWindow: React.FC = () => {
    const [activeModules, setActiveModules] = useState<
        Map<string, OverfloatModule>
    >(new Map<string, OverfloatModule>());

    useEffect(() => {

        // Disable refreshing the main window.
        document.addEventListener('keydown', function(event) {
            if (event.key === 'F5' || (event.ctrlKey && event.key === 'r') || (event.metaKey && event.key === 'r')) {
              event.preventDefault();
            }
        });

        // Disable the context menu in the main window.
        document.addEventListener('contextmenu', function(event) {
            event.preventDefault();
        });


        // Function to update the active modules
        const updateModules = () => {
            setActiveModules(
                new Map<string, OverfloatModule>(
                    ModuleManager.getInstance().getActiveModules()
                )
            );
        };

        // Close the app when this window is closed
        appWindow.once("tauri://close-requested", () => invoke("quit_app"));

        // Setup the window
        const setupWindow = async () => {
            await appWindow.setSize(new PhysicalSize(60, 600));
            await appWindow.setMinSize(new PhysicalSize(60, 600));
            await appWindow.setMaxSize(new PhysicalSize(60, 600));
            appWindow.show();
        };

        // Subscribe to the module manager and keybind manager notifications
        WindowEventHandler.getInstance();
        ModuleManager.getInstance().subscribe(updateModules);
        KeybindEventHandler.getInstance();
        KeybindManager.getInstance().subscribe(updateModules);

        // Initialize the modules and setup the window
        updateModules();
        setupWindow();

        // Unsubscribe from the module manager and keybind manager notifications on unmount
        return () => {
            ModuleManager.getInstance().unsubscribe(updateModules);
            KeybindManager.getInstance().unsubscribe(updateModules);
            ModuleManager.getInstance().closeAllModules();
        };
    }, []);

    // State for the shown submenu
    const [shownSubmenu, setShownSubmenu, refShownSubmenu] =
        useStateRef<Submenu>(Submenu.None);

    // Function to toggle the submenu
    const toggleSubmenu = async (submenu: Submenu) => {
        const shownSubmenu = refShownSubmenu.current;

        // Increase the size of the window when the submenu is shown and wasn't shown before
        if (shownSubmenu == Submenu.None) {
            await appWindow.setSize(new PhysicalSize(1000, 600));
            await appWindow.setMinSize(new PhysicalSize(1000, 600));
            await appWindow.setMaxSize(new PhysicalSize(1000, 600));
            setShownSubmenu(submenu);
        
        // Only show the taskbar when the already shwon submenu is clicked
        } else if (shownSubmenu == submenu) {
            setShownSubmenu(Submenu.None);
            await appWindow.setSize(new PhysicalSize(60, 600));
            await appWindow.setMinSize(new PhysicalSize(60, 600));
            await appWindow.setMaxSize(new PhysicalSize(60, 600));
        } else {
            setShownSubmenu(submenu);
        }
    };

    return (
        <div className="container-fluid p-0">
            {/* Global style to prevent white blinks when resizing, disable text selection and hide scrollbar */}
            <GlobalStyle />
            {/* Title bar of the window */}
            <OverfloatTitleBar />
            <div className="content">
                <div className="row m-0">
                    {/* Tray  */}
                    <div className="tray col-auto p-0">
                        {/* Buttons for toggling the submenus */}
                        <button
                            className={
                                shownSubmenu == Submenu.Modules
                                    ? "tray-button tray-button-active"
                                    : "tray-button tray-button-inactive"
                            }
                            onClick={() => toggleSubmenu(Submenu.Modules)}>
                            <IconApps color="white" size={48}/>
                        </button>
                        <button
                            className={
                                shownSubmenu == Submenu.Shortcuts
                                    ? "tray-button tray-button-active"
                                    : "tray-button tray-button-inactive"
                            }
                            onClick={() => toggleSubmenu(Submenu.Shortcuts)}>
                            <IconKeyboard color="white" size={48}/>
                        </button>
                        <div className="separator" />
                        
                        {/* Tray displays of active modules */}
                        {Array.from(activeModules).map(
                            ([moduleName, module]) => (
                                <TrayModule key={moduleName} module={module} />
                            )
                        )}
                    </div>
                    {/* Module and Profile settings submenu */}
                    <div
                        className={
                            shownSubmenu == Submenu.Modules
                                ? "detail col"
                                : "d-none"
                        }>
                        <ModuleSettings />
                    </div>

                    {/* Shortcut settings submenu */}
                    <div
                        className={
                            shownSubmenu == Submenu.Shortcuts
                                ? "detail col"
                                : "d-none"
                        }>
                        <ShortcutSettings activeModules={activeModules} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverfloatWindow;
