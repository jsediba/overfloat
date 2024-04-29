/*****************************************************************************
 * @FilePath    : src/components/Modules/ModuleSettings.tsx                  *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect, useState } from "react";
import { ModuleManager } from "../../utils/ModuleManager";
import ProfileSettings from "./ProfileSettings";
import { OverfloatModule } from "../../utils/OverfloatModule";
import ActiveModuleDisplay from "./ActiveModuleDisplay";
import InactiveModuleDisplay from "./InactiveModuleDisplay";
import ToggleElementDisplayButton from "./ToggleElementDisplayButton";

/**
 * React component for the Module and Profile settings submenu.
 */
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
        // Function to update the active and inactive modules
        const updateModules = () => {
            setActiveModules(
                new Map<string, OverfloatModule>(
                    ModuleManager.getInstance().getActiveModules()
                )
            );
            setInactiveModules([
                ...ModuleManager.getInstance().getInactiveModules(),
            ]);
            console.log("Updated Modules");
        };

        // Subscribe to the module manager notifications
        ModuleManager.getInstance().subscribe(updateModules);

        // Unsubscribe from the module manager notifications on unmount
        return () => {
            ModuleManager.getInstance().unsubscribe(updateModules);
        };
    }, []);

    return (
        <div className="container-fluid">
            {/* Profile Settings */}
            <div className="contrainer p-0">
                <div className="row">
                    <div className="col">
                        <h2 className="h2 fw-bold fst-italic">
                            <ToggleElementDisplayButton id="profileContainer" />
                            Profile Settings
                        </h2>
                    </div>
                </div>
                <div className="container" id="profileContainer">
                    <ProfileSettings />
                </div>
            </div>

            <hr />

            {/* Module Settings */}
            <div className="container p-0">
                <div className="row">
                    <div className="col">
                        <h2 className="h2 fw-bold fst-italic">
                            <ToggleElementDisplayButton id="modulesContainer" />
                            Module Settings
                        </h2>
                    </div>
                </div>

                {/* Active Modules */}
                <div className="container" id="modulesContainer">
                    <div
                        style={{
                            display: activeModules.size == 0 ? "none" : "block",
                        }}>
                        <div className="row">
                            <div className="col">
                                <h3 className="h3 fw-bold">
                                    <ToggleElementDisplayButton id="activeModulesContainer" />
                                    Active Modules
                                </h3>
                            </div>
                        </div>
                        <div id="activeModulesContainer">
                            {Array.from(activeModules).map(
                                ([moduleName, module]) => (
                                    <ActiveModuleDisplay
                                        key={moduleName + new Date()}
                                        module={module}
                                    />
                                )
                            )}
                        </div>
                    </div>

                    <hr
                        style={{
                            display:
                                activeModules.size == 0 ||
                                inactiveModules.length == 0
                                    ? "none"
                                    : "block",
                        }}
                    />

                    {/* Inactive Modules */}
                    <div
                        style={{
                            display:
                                inactiveModules.length == 0 ? "none" : "block",
                        }}>
                        <div className="row">
                            <div className="col">
                                <h3 className="h3 fw-bold">
                                    <ToggleElementDisplayButton id="inactiveModulesContainer" />
                                    Inactive Modules
                                </h3>
                            </div>
                        </div>
                        <div id="inactiveModulesContainer">
                            {inactiveModules.map((moduleName) => (
                                <InactiveModuleDisplay
                                    key={moduleName}
                                    moduleName={moduleName}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleSettings;
