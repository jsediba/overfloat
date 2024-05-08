/*****************************************************************************
 * @FilePath    : src/components/Tray/TrayModule.tsx                         *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect, useRef } from "react";
import useStateRef from "react-usestateref";
import { OverfloatModule } from "../../utils/OverfloatModule";
import "./css/Tray.css";
import TraySubwindows from "./TraySubwindows";
import TrayWindowIcon from "./TrayWindowIcon";

interface TrayModuleProps {
    module: OverfloatModule;
}

/**
 * React component for displaying a single module in the tray.
 */
const TrayModule: React.FC<TrayModuleProps> = (props: TrayModuleProps) => {
    const module = props["module"];
    const containerRef = useRef<HTMLDivElement>(null);

    // State for the visibility of the main window, this changes the background color of the button
    const [_, setVisible, refVisible] = useStateRef<boolean>(
        module.getMainWindow().visible
    );

    useEffect(() => {
        module.subscribe(() => setVisible(module.getMainWindow().visible));

        return () => {
            module.unsubscribe(() =>
                setVisible(module.getMainWindow().visible)
            );
        };
    }, []);

    // Function to get the path to the module's main window icon
    const getModuleIconPath = () => {
        return (
            "../overfloat_modules/" + module.getModuleName() + "/icons/icon.png"
        );
    };

    return (
        <div className="module-container" ref={containerRef}>
            {/* Button representing the module, clicking it toggles the main window */}
            <button
                className={
                    refVisible.current
                        ? "module-button module-button-active text-truncate"
                        : "module-button module-button-inactive text-truncate"
                }
                title={module.getModuleName()}
                onClick={() => {
                    if (refVisible.current) module.hideMainWindow();
                    else module.showMainWindow();
                }}>
                {/* Icon for the main window of the module */}
                <TrayWindowIcon
                    webview={module.getMainWindow().webview}
                    imgPath={getModuleIconPath()}
                />
            </button>
            {/* Subwindows of the module */}
            <TraySubwindows module={module} containerRef={containerRef}/>
        </div>
    );
};

export default TrayModule;
