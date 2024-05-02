/*****************************************************************************
 * @FilePath    : src/components/Modules/ActiveModuleDisplay.tsx             *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect, useState } from "react";
import { OverfloatModule } from "../../utils/OverfloatModule";
import { Window } from "../../utils/OverfloatModule";
import SubwindowDisplay from "./SubwindowDisplay";
import { IconMaximize, IconMinus, IconX } from "@tabler/icons-react";
import ToggleElementDisplayButton from "./ToggleElementDisplayButton";

type ActiveModuleDisplayProps = {
    module: OverfloatModule;
};

/**
 * React component for the display of an active module.
 */
const ActiveModuleDisplay: React.FC<ActiveModuleDisplayProps> = (
    props: ActiveModuleDisplayProps
) => {
    const module: OverfloatModule = props["module"];
    const [subwindows, setSubwindows] = useState<Map<string, Window>>(
        new Map<string, Window>(module.getSubwindows())
    );

    useEffect(() => {
        // Function to update the subwindows
        const updateSubwindows = () => {
            setSubwindows(new Map<string, Window>(module.getSubwindows()));
        };

        // Subscribe to the module change notifications
        module.subscribe(updateSubwindows);

        // Unsubscribe from the module change notifications on unmount
        return () => {
            module.unsubscribe(updateSubwindows);
        };
    }, []);

    return (
        <div className="container">
            <div className="row">
                {/* Module header */}
                <div className="col fw-bold">
                    <ToggleElementDisplayButton
                        id={"activeModuleContainer-" + module.getModuleName()}
                    />
                    {module.getModuleName()}
                </div>
                {/* Button to close the module */}
                <div className="col-auto">
                    <button
                        className="moduleCloseButton"
                        onClick={() => {
                            module.closeModule();
                        }}
                        title="Close Module">
                        <IconX />
                    </button>
                </div>
            </div>
            {/* Module windows */}
            <div
                className="container"
                id={"activeModuleContainer-" + module.getModuleName()}>
                <div className="container">
                    {/* Main window */}
                    <div className="row">
                        <div className="col-10">Main Window</div>
                        <div className="col-2">
                            <div className="btn-group">
                                {/* Toggle main window visibility button */}
                                <button
                                    className="windowControlButton"
                                    onClick={() => {
                                        if (module.getMainWindow().visible) {
                                            module.hideMainWindow();
                                        } else {
                                            module.showMainWindow();
                                        }
                                    }}
                                    title={
                                        (module.getMainWindow().visible
                                            ? "Hide"
                                            : "Show") + " Window"
                                    }>
                                    {module.getMainWindow().visible ? (
                                        <IconMinus />
                                    ) : (
                                        <IconMaximize />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Subwindows */}
                    {Array.from(subwindows).map(([label, window]) => (
                        <SubwindowDisplay
                            key={label}
                            module={module}
                            window={window}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActiveModuleDisplay;
