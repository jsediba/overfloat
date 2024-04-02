import "react";
import { useEffect } from "react";
import { openSubwindow } from "../../src/services/api";
import { TitleBar } from "../../src/services/TitleBar";

/*
export type AddShortcutEventPayload = {
    id: string,
    name: string,
    description: string,
    callback: Function,
    defaultKeybind?: string
}
*/

const Central = () => {

    useEffect(() => {
        return () => {
        }
    }, []);


    const newWindow = (keybind: string) => {
        openSubwindow('counter', `Counter ${keybind}`, {"keybind": keybind});
        console.log("opening new subwindow");
    };

    return (
        <div className="container">
            <TitleBar/>
            <div className="row">
                <div className="col">Test Control Central</div>
            </div>
            <div className="row">
                <div className="col">
                    <button onClick={() => newWindow("A")}>[a]</button>
                </div>
                <div className="col">
                    <button onClick={() => newWindow("S")}>[s]</button>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <button onClick={() => newWindow("D")}>[d]</button>
                </div>
                <div className="col">
                    <button onClick={() => newWindow("F")}>[f]</button>
                </div>
            </div>
        </div>
    );
};

export default Central;
