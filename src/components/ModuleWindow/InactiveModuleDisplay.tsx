import { useEffect } from "react";
import { ModuleManager } from "../../utils/ModuleManager";

interface InactiveModuleDisplayProps {
    moduleName: string;
}

const InactiveModuleDisplay: React.FC<InactiveModuleDisplayProps> = (
    props: InactiveModuleDisplayProps
) => {
    const moduleName = props["moduleName"];

    useEffect(() => {}, []);

    return (
        <div className="row">
            <div className="col">{moduleName}</div>
            <button
                className="btn btn-primary col"
                onClick={() =>
                    ModuleManager.getInstance().startModule(moduleName)
                }>
                Start
            </button>
        </div>
    );
};

export default InactiveModuleDisplay;
