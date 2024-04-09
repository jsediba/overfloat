import { useEffect, useState } from "react";
import { Window } from "../../utils/OverfloatModule";
import ShortcutDisplay from "./ShortcutDispay";

type WindowShorctusProps = {
    moduleName: string;
    window: Window;
};

const WindowShorctus: React.FC<WindowShorctusProps> = (
    props: WindowShorctusProps
) => {
    const moduleName = props["moduleName"];
    const window = props["window"];

    const [windowTitle, setWindowTitle] = useState<string>(
        window.webview.label
    );

    useEffect(() => {
        window.webview.title().then((title) => setWindowTitle(title));
    }, []);

    return (
        <div className="container">
            {window.shortcuts.size != 0 && <h4>{windowTitle}</h4>}
            {Array.from(window.shortcuts).map(([id, shortcut]) => (
                <ShortcutDisplay
                    key={id}
                    moduleName={moduleName}
                    shortcut={shortcut}
                />
            ))}
        </div>
    );
};

export default WindowShorctus;
