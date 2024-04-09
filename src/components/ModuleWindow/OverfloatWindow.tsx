import { useState, useEffect, useRef } from "react";
import useStateRef from "react-usestateref";
import { OverfloatModule } from "../../utils/OverfloatModule";
import { ModuleManager } from "../../utils/ModuleManager";
import ActiveModuleDisplay from "./ActiveModuleDisplay";
import InactiveModuleDisplay from "./InactiveModuleDisplay";
import { WindowEventHandler } from "../../utils/WindowEventHandler";
import { KeybindManager } from "../../utils/KeybindManager";
import { KeybindEventHandler } from "../../utils/KeybindEventHandler";
import "./css/ModuleWindow.css";
import { PhysicalSize, appWindow } from "@tauri-apps/api/window";
import TitleBar from "./TitleBar";
import { createGlobalStyle } from "styled-components";
import TrayModule from "./TrayModule";

enum Submenu {
    None,
    Modules,
    Shortcuts,
}


const GlobalStyle = createGlobalStyle`body{background-color: rgb(75,75,75);
    user-select: none;
   -moz-user-select: none;
   -ms-user-select: none;
   -webkit-user-select: none;`;

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

        const setupWindow = async () => {
            await appWindow.setSize(new PhysicalSize(60, 600));
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
        };
    }, []);

    const [shownSubmenu, setShownSubmenu, refShownSubmenu] =
        useStateRef<Submenu>(Submenu.None);

    const toggleSubmenu = async (submenu: Submenu) => {
        const shownSubmenu = refShownSubmenu.current;

        if (shownSubmenu == Submenu.None) {
            await appWindow.setSize(new PhysicalSize(600, window.innerHeight));
            setShownSubmenu(submenu);
        } else if (shownSubmenu == submenu) {
            setShownSubmenu(Submenu.None);
            await appWindow.setSize(new PhysicalSize(60, window.innerHeight));
        } else {
            setShownSubmenu(submenu);
        }
    };


    return (
        <div className="container-fluid p-0">
            <GlobalStyle />
            <TitleBar/>
            <div className="row m-0">
                <div className="tray col-auto p-0">
                    <button
                        className={
                            shownSubmenu == Submenu.Modules
                                ? "tray-button tray-button-active"
                                : "tray-button tray-button-inactive"
                        }
                        onClick={() => toggleSubmenu(Submenu.Modules)}>
                        <img className="tray-button-icon" src="/modules.svg" />
                    </button>
                    <button
                        className={
                            shownSubmenu == Submenu.Shortcuts
                                ? "tray-button tray-button-active"
                                : "tray-button tray-button-inactive"
                        }
                        onClick={() => toggleSubmenu(Submenu.Shortcuts)}>
                        <img className="tray-button-icon" src="/keyboard.svg" />
                    </button>
                    <div className="separator" />
                    {Array.from(activeModules).map(([moduleName, module]) => (
                        <TrayModule key={moduleName} module={module} />
                    ))}
                </div>
                <div
                    className={
                        shownSubmenu == Submenu.Modules
                            ? "detail col bg-secondary"
                            : "d-none"
                    }>
                    <h2>Module Settings</h2>
                    <select id="profileSelect" onChange={(event) => ModuleManager.getInstance().loadProfile(event.target.value)}>
                        {ModuleManager.getInstance()
                            .getProfiles()
                            .map((profileName, index) => (
                                <option value={profileName} key={index}>
                                    {profileName}
                                </option>
                            ))}
                    </select>
                </div>
                <div
                    className={
                        shownSubmenu == Submenu.Shortcuts
                            ? "detail col bg-secondary"
                            : "d-none"
                    }>
                    <h2>Keybind Settings</h2>
                </div>
            </div>
        </div>
    );
};

export default OverfloatWindow;
