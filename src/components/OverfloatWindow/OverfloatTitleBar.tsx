/*****************************************************************************
 * @FilePath    : src/components/OverfloatWindow/OverfloatTitleBar.tsx       *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useState } from "react";
import "../../Api/css/TitleBar.css";
import { invoke } from "@tauri-apps/api";
import { PhysicalSize, appWindow } from "@tauri-apps/api/window";
import { IconCornerDownLeft, IconCornerUpRight, IconMinus } from "@tabler/icons-react";

/**
 * React component for the title bar of the overfloat window.
 */
const OverfloatTitleBar: React.FC = () => {

    // State for the rolled up state of the window
    const [rolledUp, setRolledUp] = useState<boolean>(false);

    // Roll up the window, only showing the title bar
    const rollUp = async () => {
        await appWindow.setSize(new PhysicalSize(innerWidth, 20))
        await appWindow.setMinSize(new PhysicalSize(innerWidth, 20))
        await appWindow.setMaxSize(new PhysicalSize(innerWidth, 20))
        setRolledUp(true);
    };

    // Roll down the window, showing the full window
    const rollDown = async () => {
        await appWindow.setSize(new PhysicalSize(innerWidth, 600))
        await appWindow.setMinSize(new PhysicalSize(innerWidth, 600))
        await appWindow.setMaxSize(new PhysicalSize(innerWidth, 600))
        setRolledUp(false);
    };

    return (
        <div data-tauri-drag-region={true} className="titlebar p-0 m-0">
            {/* Roll Up Button */}
            <button
                onClick={() => {
                    rollUp();
                }}
                className={rolledUp ? "d-none" : "titlebar-button m-0"}>
                <IconCornerDownLeft size={12}/>
            </button>
            {/* Roll Down Button */}
            <button
                onClick={() => {
                    rollDown();
                }}
                className={rolledUp ? "titlebar-button m-0" : "d-none"}>
                <IconCornerUpRight size={12}/>
            </button>
            {/* Minimize Button */}
            <button
                onClick={() => {
                    invoke("hide_app");
                }}
                className="titlebar-button m-0">
                <IconMinus size={12}/>
            </button>
        </div>
    );
};

export default OverfloatTitleBar;
