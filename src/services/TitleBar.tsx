import { appWindow } from "@tauri-apps/api/window";
import "./TitleBar.css";
import { useEffect, useState } from "react";
import { closeMainWindow, closeSubwindow, hideMainWindow, hideSubwindow } from "./api";


export const TitleBar: React.FC = () => {
    const [windowTitle, setWindowTitle] = useState<string>("");
    
    const isSubwindow = ():boolean =>{
        const submodule = appWindow.label.replace(/module\/([^/]*)\/?(.*)?/g, "$2");
        return submodule.length != 0;
    }
    
    const subwindow: boolean = isSubwindow();

    const closeWindow = () => {
        if (subwindow){
            closeSubwindow();
        } else {
            closeMainWindow();
        }
    }

    const minimizeWindow = () => {
        if (subwindow){
            hideSubwindow();
        } else {
            hideMainWindow();
        }
    }

    useEffect(() => {
        appWindow.title().then((title) => setWindowTitle(title));
    }, [])

    return (
        <div data-tauri-drag-region={true} className="titlebar container-fluid mb-2 px-0">
            <div data-tauri-drag-region={true} className="titlebar-title">
                {windowTitle}
            </div>
            <button onClick={() => minimizeWindow()} className="titlebar-button">
                <img
                    className="button-icon"
                    src="/window_minimize.svg"
                    alt="minimize"
                />
            </button>
            <button onClick={() => closeWindow()} className="titlebar-button">
                <img
                    className="button-icon"
                    src="/window_close.svg"
                    alt="close"
                />
            </button>
        </div>
    );
};