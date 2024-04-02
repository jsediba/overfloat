import { useState, useEffect } from "react";
import { KeybindManager, Shortcut } from "../../utils/KeybindManager";
import ModuleKeybindDisplay from "./ModuleKeybindDisplay";
import { KeybindEventHandler } from "../../utils/KeybindEventHandler";

const KeybindWindow: React.FC = () => {
    const [shortcuts, setShortcuts] = useState<Map<string, Map<string, Shortcut>>>(KeybindManager.getInstance().getShortcuts());
    
    useEffect(() => {
        const updateModules = () => {
            setShortcuts(new Map<string, Map<string, Shortcut>>(KeybindManager.getInstance().getShortcuts()));
        };
        
        KeybindManager.getInstance().subscribe(updateModules);
        KeybindEventHandler.getInstance();

        return () => {
            KeybindManager.getInstance().unsubscribe(updateModules);
        };
    }, []);

    return (
    <div className="container">
        {Array.from(shortcuts).map(([module, shortcuts]) => (
                <div key={module}>
                    Module: {module}
                    <ModuleKeybindDisplay shortcuts={shortcuts}/>
                </div>
            ))}
    </div>
    );
};

export default KeybindWindow;
