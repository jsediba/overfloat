import { useEffect, useState } from "react";
import { ShortcutManager, watchPath } from "../../src/services/api";
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
            ["ShiftLeft+A"]
        );

        ShortcutManager.addShortcut(
            "test_input",
            "test",
            "test",
            () =>
                inputSimulation([simKeyDown("ShiftRight"),simKeyPress("Num1"),simKeyPress("Num2"),simKeyPress("Num3"),simKeyPress("Num4"),simKeyUp("ShiftRight")]),
            ["ShiftLeft+B"]
        );

        watchPath(
            "Testing",
            "C:\\Users\\Urcier\\linuxstuff\\bp\\test",
            () => {}
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
            </div>
        </div>
    );
};

export default TestComponent;
