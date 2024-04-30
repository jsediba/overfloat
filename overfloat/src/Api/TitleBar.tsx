/*****************************************************************************
 * @FilePath    : src/Api/TitleBar.tsx                                       *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { appWindow } from "@tauri-apps/api/window";
import "./css/TitleBar.css";
import { useEffect, useState } from "react";
import { IconMinus, IconX } from "@tabler/icons-react";
import {
    closeWindow,
    hideWindow,
} from "./WindowOperations";

/**
 * React component for the title bar of the window.
 */
export const TitleBar: React.FC = () => {
    const [windowTitle, setWindowTitle] = useState<string>("");

    useEffect(() => {
        appWindow.title().then((title) => setWindowTitle(title));
    }, []);

    return (
        <div
            data-tauri-drag-region={true}
            className="titlebar container-fluid mb-2 px-0">
            {/* Title of the window */}
            <div data-tauri-drag-region={true} className="titlebar-title" title={appWindow.label}>
                {windowTitle}
            </div>
            {/* Minimize Button */}
            <button
                onClick={() => hideWindow()}
                className="titlebar-button">
                <IconMinus size={12}/>
            </button>
            {/* Close Button */}
            <button onClick={() => closeWindow()} className="titlebar-button">
                <IconX size={12} />
            </button>
        </div>
    );
};
