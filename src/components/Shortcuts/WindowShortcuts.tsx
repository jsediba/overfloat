/*****************************************************************************
 * @FilePath    : src/components/Shortcuts/WindowShortcuts.tsx               *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect, useState } from "react";
import { Window } from "../../utils/OverfloatModule";
import ShortcutDisplay from "./ShortcutDispay";
import ToggleElementDisplayButton from "../Modules/ToggleElementDisplayButton";

type WindowShorctusProps = {
    moduleName: string;
    window: Window;
};

/**
 * React component for the display of a window's shortcuts.
 */
const WindowShorctus: React.FC<WindowShorctusProps> = (
    props: WindowShorctusProps
) => {
    const moduleName = props["moduleName"];
    const window = props["window"];

    const [windowTitle, setWindowTitle] = useState<string>(
        window.webview.label
    );

    useEffect(() => {
        // Update the displayed name of the window to it's title on mount
        window.webview.title().then((title) => setWindowTitle(title));
    }, []);

    return (
        <div className="container">
            {/* Window header, only display if there are shortcuts */}
            {window.shortcuts.size != 0 && (
                <h4 className="h4 fw-bold">
                    <ToggleElementDisplayButton
                        id={"WindowShortcutContainer-" + window.webview.label}
                    />
                    {windowTitle}
                </h4>
            )}
            {/* Display the shortcuts */}
            <div id={"WindowShortcutContainer-" + window.webview.label}>
                {Array.from(window.shortcuts).map(([id, shortcut]) => (
                    <ShortcutDisplay
                        key={id}
                        moduleName={moduleName}
                        shortcut={shortcut}
                    />
                ))}
            </div>
        </div>
    );
};

export default WindowShorctus;
