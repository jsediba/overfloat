import "react";
import { useState, useEffect } from "react";
import { ShortcutManager, getParameter } from "../../../src/services/api";
import { TitleBar } from "../../../src/services/TitleBar";
import { appWindow } from "@tauri-apps/api/window";

const Counter = (): React.JSX.Element => {
    const keybind = getParameter("keybind");

    
    useEffect(() => {
        ShortcutManager.addShortcut(
            "count_up",
            "Increment Counter",
            "Increments the counter",
            handle_keypress,
            [keybind]
        );

        return () => {
        };
    }, []);

    const [counter, setCounter] = useState<number>(0);

    const handle_keypress = () => {
        setCounter((prev: number) => {
            return prev + 1;
        });
        console.log(appWindow.listeners);
    };


    return (
        <div>
            <TitleBar />
            <div className="container">
                <div className="row">
                    <div className="col">Counting presses of [{keybind}]</div>
                </div>
                <div className="row">
                    <div className="col">{counter}</div>
                </div>
            </div>
        </div>
    );
};

export default Counter;
