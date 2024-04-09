import { useState, useEffect } from "react";
import { OverfloatModule } from "../../utils/OverfloatModule";
import { Window } from "../../utils/OverfloatModule";
import { ModuleManager } from "../../utils/ModuleManager";
import ShortcutDisplay from "./ShortcutDispay";

interface ActiveModuleDisplayProps {
    module: OverfloatModule;
}

const ActiveModuleDisplay: React.FC<ActiveModuleDisplayProps> = (
    props: ActiveModuleDisplayProps
) => {
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

    return (
        <div className="container">
            <div className="h2">{module.getModuleName()}</div>
            <div className="row">
                <button
                    type="button"
                    className="btn btn-primary col"
                    onClick={() => {
                        module.showMainWindow();
                    }}>
                    Show Main Window
                </button>
                <button
                    type="button"
                    className="btn btn-primary col"
                    onClick={() => {
                        module.hideMainWindow();
                    }}>
                    Hide Main Window
                </button>
                <button
                    type="button"
                    className="btn btn-primary col"
                    onClick={() => {
                        ModuleManager.getInstance().closeModule(
                            module.getModuleName()
                        );
                    }}>
                    Stop Module
                </button>
            </div>
            <div className="container">
                {Array.from(subwindows).map(([label, window]) => (
                    <div className="container" key={label}>
                        <div className="row">
                            <div className="col">
                                Label: {window.webview.label}
                            </div>
                            <button
                                className="btn btn-secondary col"
                                onClick={() =>
                                    module.showSubwindow(window.webview.label)
                                }>
                                Show
                            </button>
                            <button
                                className="btn btn-secondary col"
                                onClick={() =>
                                    module.hideSubwindow(window.webview.label)
                                }>
                                Hide
                            </button>
                            <button
                                className="btn btn-secondary col"
                                onClick={() =>
                                    module.closeSubwindow(window.webview.label)
                                }>
                                Close
                            </button>
                        </div>
                        <ShortcutDisplay shortcuts={window.shortcuts} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActiveModuleDisplay;
