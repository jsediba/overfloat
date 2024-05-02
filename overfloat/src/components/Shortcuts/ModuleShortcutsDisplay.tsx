/*****************************************************************************
 * @FilePath    : src/components/Shortcuts/ModuleShortcutsDisplay.tsx        *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect, useState } from "react";
import { OverfloatModule, Window } from "../../utils/OverfloatModule";
import WindowShorctus from "./WindowShortcuts";
import ToggleElementDisplayButton from "../Modules/ToggleElementDisplayButton";

type ModuleShortcutsDisplayProps = {
    module: OverfloatModule;
};

/**
 * React component for the display of a module's shortcuts.
 */
const ModuleShortcutsDisplay: React.FC<ModuleShortcutsDisplayProps> = (
    props: ModuleShortcutsDisplayProps
) => {
    const module = props["module"];
    const [subwindows, setSubwindows] = useState<Map<string, Window>>(
        new Map(module.getSubwindows())
    );

    useEffect(() => {
        // Function to update the subwindows
        const updateSubwindows = () => {
            setSubwindows(new Map(module.getSubwindows()));
        };

        // Subscribe to the module change notifications
        module.subscribe(updateSubwindows);

        // Unsubscribe from the module change notifications on unmount
        return () => {
            module.unsubscribe(updateSubwindows);
        };
    }, []);

    if(!module.hasShortcuts()) return null;

    return (
        <div className="container">
            {/* Module header */}
            <h3 className="h3 fw-bold">
                <ToggleElementDisplayButton
                    id={"ModuleShortcutContainer-" + module.getModuleName()}
                />
                {module.getModuleName()}
            </h3>
            {/* Shortcuts of specific module windows */}
            <div id={"ModuleShortcutContainer-" + module.getModuleName()}>
                {/* Main window shortcuts */}
                <WindowShorctus
                    moduleName={module.getModuleName()}
                    window={module.getMainWindow()}
                />
                {/* Subwindow shortcuts */}
                {Array.from(subwindows).map(([id, window]) => (
                    <div key={id}>
                        <WindowShorctus
                            moduleName={module.getModuleName()}
                            window={window}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModuleShortcutsDisplay;
