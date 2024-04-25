import { appWindow } from "@tauri-apps/api/window";
import "./TitleBar.css";
import { useEffect, useState } from "react";
import { IconMinus, IconX } from "@tabler/icons-react";
import {
    closeMainWindow,
    closeSubwindow,
    hideMainWindow,
    hideSubwindow,
} from "./api";

export const TitleBar: React.FC = () => {
    const [windowTitle, setWindowTitle] = useState<string>("");

    const isSubwindow = (): boolean => {
        const submodule = appWindow.label.replace(
            /module\/([^/]*)\/?(.*)?/g,
            "$2"
        );
        return submodule.length != 0;
    };

    const subwindow: boolean = isSubwindow();

    const closeWindow = () => {
        if (subwindow) {
            closeSubwindow();
        } else {
            closeMainWindow();
        }
    };

    const minimizeWindow = () => {
        if (subwindow) {
            hideSubwindow();
        } else {
            hideMainWindow();
        }
    };

    useEffect(() => {
        appWindow.title().then((title) => setWindowTitle(title));
    }, []);

    return (
        <div
            data-tauri-drag-region={true}
            className="titlebar container-fluid mb-2 px-0">
            <div data-tauri-drag-region={true} className="titlebar-title">
                {windowTitle}
            </div>
            <button
                onClick={() => minimizeWindow()}
                className="titlebar-button">
                <IconMinus size={12}/>
            </button>
            <button onClick={() => closeWindow()} className="titlebar-button">
                <IconX size={12} />
            </button>
        </div>
    );
};
