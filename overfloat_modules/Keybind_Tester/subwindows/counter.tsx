/*****************************************************************************
 * @FilePath    : overfloat_modules/Keybind_Tester/subwindows/counter.tsx    *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import "react";
import { useState, useEffect } from "react";
import { ModuleWindow, ShortcutManager, getParameter } from "@OverfloatAPI";

const Counter = (): React.JSX.Element => {
    const keybind = getParameter("keybind");

    useEffect(() => {
        ShortcutManager.addShortcut(
            "count_up",
            "Increment Counter",
            "Increments the counter displayed in this subwindow.",
            handle_keypress,
            keybind? [keybind] : []
        );

        return () => {};
    }, []);

    const [counter, setCounter] = useState<number>(0);

    const handle_keypress = () => {
        setCounter((prev: number) => {
            return prev + 1;
        });
    };

    return (
        <ModuleWindow>
            <div className="container text-center">
                <div className="row">
                    <div className="col h2">Counting:</div>
                </div>
                <div className="row">
                    <div className="col h2">{counter}</div>
                </div>
            </div>
        </ModuleWindow>
    );
};

export default Counter;
