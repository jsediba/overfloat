import { useState, useEffect } from "react";
import { OverfloatModule } from "../../utils/OverfloatModule";
import { WebviewWindow } from "@tauri-apps/api/window";

interface ModuleDisplayProps {
    module: OverfloatModule;
}

const ModuleDisplay: React.FC<ModuleDisplayProps> = (props: ModuleDisplayProps) => {
    const module = props["module"];

    const [mainWindow, setMainWindow] = useState<WebviewWindow | null>(module.getMainWindow());
    const [subwindows, setSubwindows] = useState<Map<string, WebviewWindow>>(module.getSubwindows());

    useEffect(() => {
        const updateModuleWindows = () => {
            setMainWindow(module.getMainWindow());
            setSubwindows(new Map<string, WebviewWindow>(module.getSubwindows()));
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
            <div className="row">Main window is {mainWindow === null ? "closed" : "opened"}</div>
            <div className="row">
                <button
                    type="button"
                    className="btn btn-primary col"
                    onClick={() => {
                        module.showMainWindow();
                    }}>
                    Show
                </button>
                <button
                    type="button"
                    className="btn btn-primary col"
                    onClick={() => {
                        module.hideMainWindow();
                    }}>
                    Hide
                </button>
                <button
                    type="button"
                    className="btn btn-primary col"
                    onClick={() => {
                        module.closeMainWindow();
                    }}>
                    Close
                </button>
            </div>
            <div className="container">
                {Array.from(subwindows).map(([label, window]) => (
                    <div className="row" key={label}>
                        <div className="col">Label: {window.label}</div>
                        <button className="btn btn-secondary col" onClick={() => module.showSubwindow(window.label)}>Show</button>
                        <button className="btn btn-secondary col" onClick={() => module.hideSubwindow(window.label)}>Hide</button>
                        <button className="btn btn-secondary col" onClick={() => module.closeSubwindow(window.label)}>Close</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ModuleDisplay;
