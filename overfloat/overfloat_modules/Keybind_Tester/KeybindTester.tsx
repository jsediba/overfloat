/*****************************************************************************
 * @FilePath    : overfloat_modules/Keybind_Tester/KeybindTester.tsx         *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect } from "react";
import { ModuleWindow, ShortcutManager, openSubwindow, Key, ModifierKey } from "@OverfloatAPI";

const Keybind_Tester = () => {
    useEffect(() => {
        ShortcutManager.addShortcut(
            "spawn_counter",
            "Spawn Counter",
            "Spawns a new counter subwindow without a bound key.",
            () => {
                openSubwindow("counter", "Counter");
            },
            [{ key: Key.X, modifiers: [ModifierKey.Alt]}]
        );

        return () => {};
    }, []);

    const newWindow = (keybind: string) => {
        openSubwindow("counter", `Counter ${keybind}`, { keybind: keybind });
        console.log("opening new subwindow");
    };

    return (
        <ModuleWindow>
            <div className="container text-center">
                <div className="row">
                    <div className="col text-center h2">Keybind Tester</div>
                </div>
                <div className="row">
                    <div className="col">
                        <button className="btn btn-primary" onClick={() => newWindow("A")}>[A]</button>
                    </div>
                    <div className="col">
                        <button className="btn btn-primary" onClick={() => newWindow("B")}>[B]</button>
                    </div>
                </div>
                <div className="row mt-1">
                    <div className="col">
                        <button className="btn btn-primary" onClick={() => newWindow("C")}>[C]</button>
                    </div>
                    <div className="col">
                        <button className="btn btn-primary" onClick={() => newWindow("D")}>[D]</button>
                    </div>
                </div>
            </div>
        </ModuleWindow>
    );
};

export default Keybind_Tester;
