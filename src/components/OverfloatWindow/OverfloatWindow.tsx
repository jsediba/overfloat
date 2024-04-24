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

enum Submenu {
    None,
    Modules,
    Shortcuts,
}

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

const OverfloatWindow: React.FC = () => {
    const [activeModules, setActiveModules] = useState<
        Map<string, OverfloatModule>
    >(new Map<string, OverfloatModule>());

    useEffect(() => {
        const updateModules = () => {
            setActiveModules(
                new Map<string, OverfloatModule>(
                    ModuleManager.getInstance().getActiveModules()
                )
            );
        };

        appWindow.once("tauri://close-requested", () => invoke("quit_app"));

        const setupWindow = async () => {
            await appWindow.setSize(new PhysicalSize(60, 600));
            await appWindow.setMinSize(new PhysicalSize(60, 600));
            await appWindow.setMaxSize(new PhysicalSize(60, 600));
            appWindow.show();
        };

        WindowEventHandler.getInstance();
        ModuleManager.getInstance().subscribe(updateModules);
        KeybindEventHandler.getInstance();
        KeybindManager.getInstance().subscribe(updateModules);

        updateModules();

        setupWindow();
        return () => {
            ModuleManager.getInstance().unsubscribe(updateModules);
            KeybindManager.getInstance().unsubscribe(updateModules);
            ModuleManager.getInstance().closeAllModules();
        };
    }, []);

    const [shownSubmenu, setShownSubmenu, refShownSubmenu] =
        useStateRef<Submenu>(Submenu.None);

    const toggleSubmenu = async (submenu: Submenu) => {
        const shownSubmenu = refShownSubmenu.current;

        if (shownSubmenu == Submenu.None) {
            await appWindow.setSize(new PhysicalSize(1000, 600));
            await appWindow.setMinSize(new PhysicalSize(1000, 600));
            await appWindow.setMaxSize(new PhysicalSize(1000, 600));
            setShownSubmenu(submenu);
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
            <GlobalStyle />
            <OverfloatTitleBar />
            <div className="content">
                <div className="row m-0">
                    <div className="tray col-auto p-0">
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
                        {Array.from(activeModules).map(
                            ([moduleName, module]) => (
                                <TrayModule key={moduleName} module={module} />
                            )
                        )}
                    </div>
                    <div
                        className={
                            shownSubmenu == Submenu.Modules
                                ? "detail col bg-secondary"
                                : "d-none"
                        }>
                        <ModuleSettings />
                    </div>
                    <div
                        className={
                            shownSubmenu == Submenu.Shortcuts
                                ? "detail col bg-secondary"
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
