import { useState, useEffect } from "react";
import { OverfloatModule } from "../../utils/OverfloatModule";
import { Window } from "../../utils/OverfloatModule";
import "./css/TrayModule.css";

interface TrayModuleProps {
    module: OverfloatModule;
}

const TrayModule: React.FC<TrayModuleProps> = (props: TrayModuleProps) => {
    const module = props["module"];

    const [subwindows, setSubwindows] = useState<Map<string, Window>>(
        module.getSubwindows()
    );

    useEffect(() => {
        const updateModuleWindows = () => {
            setSubwindows(new Map<string, Window>(module.getSubwindows()));
        };

        module.subscribe(updateModuleWindows);
        updateModuleWindows();

        return () => {
            module.unsubscribe(updateModuleWindows);
        };
    }, []);

    if (subwindows.size == 0) {
        return (
            <div className="module-container">
                <button
                    className={
                        module.getMainWindow().visible
                            ? "module-button module-button-active"
                            : "module-button module-button-inactive"
                    }
                    title={module.getModuleName()}
                    onClick={() => {
                        if (module.getMainWindow().visible)
                            module.hideMainWindow();
                        else module.showMainWindow();
                    }}>
                    {module.getModuleName().length <= 7
                        ? module.getModuleName()
                        : module.getModuleName().substring(0, 4) + "..."}
                </button>
            </div>
        );
    } else {
        return (
            <div className="module-container-with-subwindows">
                <button
                    className={
                        module.getMainWindow().visible
                            ? "module-button module-button-active"
                            : "module-button module-button-inactive"
                    }
                    title={module.getModuleName()}
                    onClick={() => {
                        if (module.getMainWindow().visible)
                            module.hideMainWindow();
                        else module.showMainWindow();
                    }}>
                    {module.getModuleName().length <= 7
                        ? module.getModuleName()
                        : module.getModuleName().substring(0, 4) + "..."}
                </button>
                <button className="show-subwindows-button">
                    <img
                        className="show-subwindows-icon"
                        src="/arrow_down.svg"
                        alt="Show Subwindows"
                    />
                </button>
            </div>
        );
    }
};

export default TrayModule;
