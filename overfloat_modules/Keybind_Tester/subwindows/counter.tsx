import "react";
import { useState, useEffect } from "react";
import { ShortcutManager, getParameter } from "../../../src/services/api";
import { TitleBar } from "../../../src/services/TitleBar";

const Counter = (): React.JSX.Element => {
    const keybind = getParameter("keybind");

    useEffect(() => {
        ShortcutManager.addShortcut(
            "count_up",
            "Increment Counter",
            "Increments the counter displayed in this subwindow.",
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
    };

    return (
        <div>
            <TitleBar />
            <div className="container text-center">
                <div className="row">
                    <div className="col h2">Counting:</div>
                </div>
                <div className="row">
                    <div className="col h2">{counter}</div>
                </div>
            </div>
        </div>
    );
};

export default Counter;
