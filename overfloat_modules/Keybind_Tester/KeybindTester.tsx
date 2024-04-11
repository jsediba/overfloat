import { useEffect } from "react";
import { ShortcutManager, openSubwindow } from "../../src/services/api";
import { TitleBar } from "../../src/services/TitleBar";


const Keybind_Tester = () => {

    useEffect(() => {

        ShortcutManager.addShortcut("spawn_counter",
            "Spawn Counter", "Spawns a new counter subwindow without a bound key.",
            () => {
                openSubwindow("counter", "Counter")
            },
            ["Alt+X"]);

        return () => { }
    }, []);


    const newWindow = (keybind: string) => {
        openSubwindow('counter', `Counter ${keybind}`, { "keybind": keybind });
        console.log("opening new subwindow");
    };

    return (
        <div>
            <TitleBar />
            <div className="container text-center">
                <div className="row">
                    <div className="col text-center h2">Keybind Tester</div>
                </div>
                <div className="row">
                    <div className="col">
                        <button onClick={() => newWindow("A")}>[A]</button>
                    </div>
                    <div className="col">
                        <button onClick={() => newWindow("B")}>[B]</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <button onClick={() => newWindow("C")}>[C]</button>
                    </div>
                    <div className="col">
                        <button onClick={() => newWindow("D")}>[D]</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col">Press Alt+X to open a new counter.</div>
                </div>
            </div>
        </div>
    );
};

export default Keybind_Tester;
