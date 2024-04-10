import { useState, useEffect } from "react";
import { OverfloatModule } from "../../utils/OverfloatModule";
import { Window } from "../../utils/OverfloatModule";
import "./css/TraySubwindows.css";
import TraySubwindow from "./TraySubwindow";

interface TraySubwindowsProps {
    module: OverfloatModule;
}

const TraySubwindows: React.FC<TraySubwindowsProps> = (
    props: TraySubwindowsProps
) => {
    const module = props["module"];

    const [subwindows, setSubwindows] = useState<Map<string, Window>>(
        module.getSubwindows()
    );

    const [subwindowsVisible, setSubwindowsVisible] = useState<boolean>(false);

    useEffect(() => {
        const updateModuleSubwindows = () => {
            setSubwindows(new Map<string, Window>(module.getSubwindows()));
        };

        module.subscribe(updateModuleSubwindows);
        updateModuleSubwindows();

        return () => {
            module.unsubscribe(updateModuleSubwindows);
        };
    }, []);

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
                    onClick={() => setSubwindowsVisible(true)}>
                    <img className="toggle-subwindows-icon" src="/arrow_down.svg" alt="Show Subwindows" />
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
                    <img className="toggle-subwindows-icon" src="/arrow_up.svg" alt="Hide Subwindows" />
                </button>
            </div>
        );
    }
};

export default TraySubwindows;
