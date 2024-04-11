import { useEffect, useState } from "react";
import { ShortcutManager, clipboardRead, clipboardWrite, watchPath } from "../../src/services/api";
import { TitleBar } from "../../src/services/TitleBar";
import {
    inputSimulation,
    simKeyDown,
    simKeyPress,
    simKeyUp,
    simMouseMove,
} from "../../src/services/InputSimulation";

const TestComponent = () => {
    const [text, setText] = useState<string>("");

    useEffect(() => {
        ShortcutManager.addShortcut(
            "test",
            "test",
            "test",
            () =>
                setText((prev: string) => {
                    return prev + "TEST";
                }),
            ["ShiftLeft+A", "B"]
        );

        ShortcutManager.addShortcut(
            "test_input",
            "test",
            "test",
            () =>
                inputSimulation([simKeyDown("ShiftRight"),simKeyPress("Num1"),simKeyPress("Num2"),simKeyPress("Num3"),simKeyPress("Num4"),simKeyUp("ShiftRight")]),
            ["ShiftLeft+B"]
        );

    }, []);

    const testSimulation = () => {
        inputSimulation([simKeyPress("A"), simMouseMove(25, 22)]);
    };

    return (
        <div>
            <TitleBar />
            <div className="container">
                <div>{text}</div>
                <button onClick={() => testSimulation()}>
                    TEST SIMULATION
                </button>
                <button onClick={() => clipboardRead().then((res) => console.log(res))}>
                    Get Clipboard
                </button>
                <button onClick={() => clipboardWrite("Set from Overfloat")}>
                    Set Clipboard
                </button>
            </div>
        </div>
    );
};

export default TestComponent;
