import { useEffect, useState } from "react";
import { ShortcutManager, watchPath } from "../../src/services/api";
import { TitleBar } from "../../src/services/TitleBar";

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
        watchPath("Testing", "C:\\Users\\Urcier\\linuxstuff\\bp\\test", () => {});
    }, []);

    return (
        <div>
            <TitleBar/>
            <div className="container">
                <div>{text}</div>
            </div>
        </div>
    );
};

export default TestComponent;
