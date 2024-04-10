import { useEffect, useState } from "react";
import { OverfloatModule } from "../../utils/OverfloatModule";
import { Window } from "../../utils/OverfloatModule";
import SubwindowDisplay from "./SubwindowDisplay";

type ActiveModuleDisplayProps = {
    module: OverfloatModule;
};

const ActiveModuleDisplay: React.FC<ActiveModuleDisplayProps> = (
    props: ActiveModuleDisplayProps
) => {
    const module: OverfloatModule = props["module"];
    const [subwindows, setSubwindows] = useState<Map<string, Window>>(
        new Map<string, Window>(module.getSubwindows())
    );

    useEffect(() => {
        const updateSubwindows = () => {
            setSubwindows(new Map<string, Window>(module.getSubwindows()));
        };
        module.subscribe(updateSubwindows);
        return () => {
            module.unsubscribe(updateSubwindows);
        };
    }, []);

    return (
        <div className="container">
            <div className="row">
                <div className="col-10">{module.getModuleName()}</div>
                <div className="col-1">
                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            if (module.getMainWindow().visible) {
                                module.hideMainWindow();
                            } else {
                                module.showMainWindow();
                            }
                        }}>
                        {module.getMainWindow().visible? "Hide" : "Show"}
                    </button>
                </div>
                <div className="col-1">
                    <button
                        className="btn btn-primary"
                        onClick={() => module.closeModule()}>
                        Close
                    </button>
                </div>
            </div>
            <div className="container">
                {Array.from(subwindows).map(([label, window]) => (
                    <SubwindowDisplay
                        key={label}
                        module={module}
                        window={window}
                    />
                ))}
            </div>
        </div>
    );
};

export default ActiveModuleDisplay;
