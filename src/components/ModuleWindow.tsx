import { useState, useEffect } from "react";
import { OverfloatModule } from "../utils/OverfloatModule";
import { ModuleManager } from "../utils/ModuleManager";
import ModuleDisplay from "./ModuleDisplay";
import { WindowEventHandler } from "../utils/WindowEventHandler";
import { listen } from '@tauri-apps/api/event'


const TrayHandler: React.FC = () => {
    const [modules, setModules] = useState<Map<string, OverfloatModule>>(ModuleManager.getModules());


    useEffect(() => {
        const updateModules = () => {
            setModules(new Map<string, OverfloatModule>(ModuleManager.getModules()));
        };
        
        WindowEventHandler.getInstance();
        ModuleManager.subscribe(updateModules);

        const unlisten = listen('overfloat://GlobalKeyPress', (event) => {console.log(event)});

        
        return () => {
            ModuleManager.unsubscribe(updateModules);

            unlisten.then(f => f())


        };
    }, []);

    return (
        <div>
            <button onClick={() => {modules.get('central')?.showMainWindow()}}>Open Central</button>
            {Array.from(modules).map(([name, module]) => (
                <div key={name}>
                    Module: {name}
                    <ModuleDisplay module={module} />
                </div>
            ))}
        </div>
    );
};

export default TrayHandler;
