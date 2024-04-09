import { useState } from "react";
import "./css/TitleBar.css";
import { invoke } from "@tauri-apps/api";
import { PhysicalSize, appWindow } from "@tauri-apps/api/window";

type TitleBarProps = {
    updateRolledUp: (rolledUp: boolean) => void;
}

const TitleBar: React.FC<TitleBarProps> = (props: TitleBarProps) => {
    const updateRolledUp = props["updateRolledUp"];

    const [rolledUp, setRolledUp] = useState<boolean>(false);

    const rollUp = async () => {
        updateRolledUp(true);
        setRolledUp(true);
    };

    const rollDown = async () => {
        updateRolledUp(false);
        setRolledUp(false);
    };

    return (
        <div data-tauri-drag-region={true} className="titlebar p-0 m-0">
            <button
                onClick={() => {
                    rollUp();
                }}
                className={rolledUp ? "d-none" : "titlebar-button m-0"}>
                <img
                    className="button-icon"
                    src="/window_roll_up.svg"
                    alt="Roll Up"
                />
            </button>
            <button
                onClick={() => {
                    rollDown();
                }}
                className={rolledUp ? "titlebar-button m-0" : "d-none"}>
                <img
                    className="button-icon"
                    src="/window_roll_down.svg"
                    alt="Roll Down"
                />
            </button>
            <button
                onClick={() => {
                    invoke("hide_app");
                }}
                className="titlebar-button m-0">
                <img
                    className="button-icon"
                    src="/window_minimize.svg"
                    alt="Minimize"
                />
            </button>
        </div>
    );
};

export default TitleBar;
