import { useEffect, useState } from "react";
import { ModuleManager } from "../../utils/ModuleManager";
import ProfileSettings from "./ProfileSettings";
import { OverfloatModule } from "../../utils/OverfloatModule";
import ActiveModuleDisplay from "./ActiveModuleDisplay";
import InactiveModuleDisplay from "./InactiveModuleDisplay";

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
            <h2>Profile Settings</h2>
            <ProfileSettings />
            <hr />
            <h2>Module Settings</h2>
            <h3>Active Modules</h3>
            {Array.from(activeModules).map(([moduleName, module]) => (
                <ActiveModuleDisplay key={moduleName} module={module} />
            ))}
            <hr />
            <h3>Inactive Modules</h3>
            {inactiveModules.map((moduleName) => (
                <InactiveModuleDisplay
                    key={moduleName}
                    moduleName={moduleName}
                />
            ))}
        </div>
    );
};

export default ModuleSettings;
