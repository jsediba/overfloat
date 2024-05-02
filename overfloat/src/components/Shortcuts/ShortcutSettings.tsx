/*****************************************************************************
 * @FilePath    : src/components/Shortcuts/ShortcutSettings.tsx              *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { OverfloatModule } from "../../utils/OverfloatModule";
import ModuleShortcutsDisplay from "./ModuleShortcutsDisplay";

type ShortcutSettingsProps = {
    activeModules: Map<string, OverfloatModule>;
};

/**
 * React component for the Shortcut Settings submenu.
 */
const ShortcutSettings: React.FC<ShortcutSettingsProps> = (
    props: ShortcutSettingsProps
) => {
    const activeModules = props["activeModules"];

    return (
        <div className="container-fluid">
            <h2 className="h2 fw-bold fst-italic">Shortcut Settings</h2>
            <hr />
            {/* Display the shortcuts for each active module */}
            {Array.from(activeModules).map(([moduleName, module]) => (
                <ModuleShortcutsDisplay key={moduleName} module={module} />
            ))}
        </div>
    );
};

export default ShortcutSettings;
