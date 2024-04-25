import { useEffect, useState } from "react";
import { ModuleManager } from "../../utils/ModuleManager";
import ProfileSettings from "./ProfileSettings";
import { OverfloatModule } from "../../utils/OverfloatModule";
import ActiveModuleDisplay from "./ActiveModuleDisplay";
import InactiveModuleDisplay from "./InactiveModuleDisplay";
import ToggleElementDisplayButton from "./ToggleElementDisplayButton";

const ModuleSettings: React.FC = () => {
    const [activeModules, setActiveModules] = useState<
        Map<string, OverfloatModule>
    >(
        new Map<string, OverfloatModule>(
            ModuleManager.getInstance().getActiveModules()
        )
    );
    const [inactiveModules, setInactiveModules] = useState<string[]>([
        ...ModuleManager.getInstance().getInactiveModules(),
    ]);

    useEffect(() => {
        const updateModules = () => {
            setActiveModules(
                new Map<string, OverfloatModule>(
                    ModuleManager.getInstance().getActiveModules()
                )
            );
            setInactiveModules([
                ...ModuleManager.getInstance().getInactiveModules(),
            ]);
        };

        ModuleManager.getInstance().subscribe(updateModules);

        return () => {
            ModuleManager.getInstance().unsubscribe(updateModules);
        };
    }, []);

    return (
        <div className="container-fluid">
            <div className="contrainer">
                <div className="row">
                    <div className="col-11">
                        <h2 className="h2 fw-bold fst-italic">
                            Profile Settings
                        </h2>
                    </div>
                    <div className="col-1">
                        <ToggleElementDisplayButton id={"profileContainer"}/>
                    </div>
                </div>
                <div className="container" id="profileContainer">
                    <ProfileSettings />
                </div>
            </div>
            <hr />
            <div className="container">
                <h2 className="h2 fw-bold fst-italic">Module Settings</h2>
                <h3 className="h3 fw-bold">Active Modules</h3>
                {Array.from(activeModules).map(([moduleName, module]) => (
                    <ActiveModuleDisplay key={moduleName} module={module} />
                ))}
                <hr />
                <h3 className="h3 fw-bold">Inactive Modules</h3>
                {inactiveModules.map((moduleName) => (
                    <InactiveModuleDisplay
                        key={moduleName}
                        moduleName={moduleName}
                    />
                ))}
            </div>
        </div>
    );
};

export default ModuleSettings;
