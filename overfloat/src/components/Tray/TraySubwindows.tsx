/*****************************************************************************
 * @FilePath    : src/components/Tray/TraySubwindows.tsx                     *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect } from "react";
import useStateRef from "react-usestateref";
import { OverfloatModule } from "../../utils/OverfloatModule";
import { Window } from "../../utils/OverfloatModule";
import "./css/TraySubwindows.css";
import TraySubwindow from "./TraySubwindow";
import { IconCaretDownFilled, IconCaretUpFilled } from "@tabler/icons-react";

interface TraySubwindowsProps {
    module: OverfloatModule;
    containerRef: React.RefObject<HTMLDivElement>;
}

/**
 * React component for displaying a module's subwindows in the tray.
 */
const TraySubwindows: React.FC<TraySubwindowsProps> = (
    props: TraySubwindowsProps
) => {
    const module = props["module"];
    const containerRef = props["containerRef"];

    // State for the subwindows of the module
    const [subwindows, setSubwindows, refSubwindows] = useStateRef<
        Map<string, Window>
    >(module.getSubwindows());

    // State for the visibility of the subwindows
    const [subwindowsVisible, setSubwindowsVisible, refSubwindowsVisible] =
        useStateRef<boolean>(false);

    // Function to update the minimum height of the module container in the tray
    const updateMinHeight = () => {
        if (containerRef.current != null) {
            // If there are no subwindows, set the minimum height to 56px
            if (refSubwindows.current.size == 0) {
                containerRef.current.style.minHeight = "56px";
                return;
            }

            Array.from(containerRef.current.children).forEach((child) => {
                console.log(child.clientHeight);
            });

            // Calculate the minimal height of the module container in the tray
            const height = Array.from(containerRef.current.children).reduce(
                (height, child) => height + child.clientHeight,
                0
            );

            if (refSubwindowsVisible.current) {
                containerRef.current.style.minHeight = height + "px";
            } else {
                containerRef.current.style.minHeight = "76px";
            }
        }
    };

    useEffect(() => {
        const updateModuleSubwindows = () => {
            setSubwindows(new Map<string, Window>(module.getSubwindows()));
        };

        updateModuleSubwindows();
        module.subscribe(updateModuleSubwindows);

        return () => {
            module.unsubscribe(updateModuleSubwindows);
        };
    }, []);

    // Update the minimum height of the module container in the tray when the subwindows display
    // is toggled or a change in the tray container occurs.
    useEffect(() => {
        updateMinHeight();
    }, [subwindowsVisible, containerRef]);

    if (subwindows.size == 0) {
        return null;
    } else {
        return (
            <div className="m-0">
                <button
                    className={
                        subwindowsVisible
                            ? "d-none"
                            : "toggle-subwindows-button"
                    }
                    onClick={() => {
                        setSubwindowsVisible(true);
                    }}>
                    <IconCaretDownFilled color="white" size={20} />
                </button>
                <div className={subwindowsVisible ? "" : "d-none"}>
                    {Array.from(subwindows).map(([windowLabel, window]) => (
                        <TraySubwindow
                            key={windowLabel}
                            module={module}
                            windowLabel={windowLabel}
                            window={window}
                        />
                    ))}
                </div>
                <button
                    className={
                        subwindowsVisible
                            ? "toggle-subwindows-button"
                            : "d-none"
                    }
                    onClick={() => setSubwindowsVisible(false)}>
                    <IconCaretUpFilled color="white" size={20} />
                </button>
            </div>
        );
    }
};

export default TraySubwindows;
