import { useState } from "react";
import "../../api/TitleBar.css";
import { invoke } from "@tauri-apps/api";
import { PhysicalSize, appWindow } from "@tauri-apps/api/window";
import { IconCornerDownLeft, IconCornerUpRight, IconMinus } from "@tabler/icons-react";


const OverfloatTitleBar: React.FC = () => {

    const [rolledUp, setRolledUp] = useState<boolean>(false);

    const rollUp = async () => {
        await appWindow.setSize(new PhysicalSize(innerWidth, 20))
        await appWindow.setMinSize(new PhysicalSize(innerWidth, 20))
        await appWindow.setMaxSize(new PhysicalSize(innerWidth, 20))
        setRolledUp(true);
    };

    const rollDown = async () => {
        await appWindow.setSize(new PhysicalSize(innerWidth, 600))
        await appWindow.setMinSize(new PhysicalSize(innerWidth, 600))
        await appWindow.setMaxSize(new PhysicalSize(innerWidth, 600))
        setRolledUp(false);
    };

    return (
        <div data-tauri-drag-region={true} className="titlebar p-0 m-0">
            <button
                onClick={() => {
                    rollUp();
                }}
                className={rolledUp ? "d-none" : "titlebar-button m-0"}>
                <IconCornerDownLeft size={12}/>
            </button>
            <button
                onClick={() => {
                    rollDown();
                }}
                className={rolledUp ? "titlebar-button m-0" : "d-none"}>
                <IconCornerUpRight size={12}/>
            </button>
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
