import { useEffect } from "react";
import { OverfloatModule } from "../../utils/OverfloatModule";
import WindowShorctus from "./WindowShortcuts";

type ShortcutSettingsProps = {
    activeModules: Map<string, OverfloatModule>;
};

const ShortcutSettings: React.FC<ShortcutSettingsProps> = (
    props: ShortcutSettingsProps
) => {
    const activeModules = props["activeModules"];

    useEffect(() => {}, []);

    return (
        <div className="container-fluid">
            <h2>Shortcut Settings</h2>
            <hr />
            {Array.from(activeModules).map(([moduleName, module]) => (
                <div className="container" key={moduleName}>
                    <h3>{moduleName}</h3>
                    <WindowShorctus
                        moduleName={moduleName}
                        window={module.getMainWindow()}
                    />
                    {Array.from(module.getSubwindows()).map(([id, window]) => (
                        <div key={id}>
                            <WindowShorctus
                                moduleName={moduleName}
                                window={window}
                            />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default ShortcutSettings;
