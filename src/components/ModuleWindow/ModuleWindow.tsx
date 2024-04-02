import { useState, useEffect } from "react";
import { OverfloatModule } from "../../utils/OverfloatModule";
import { ModuleManager } from "../../utils/ModuleManager";
import ModuleDisplay from "./ModuleDisplay";
import { WindowEventHandler } from "../../utils/WindowEventHandler";
import { invoke } from "@tauri-apps/api";


const ModuleWindow: React.FC = () => {
    const [modules, setModules] = useState<Map<string, OverfloatModule>>(ModuleManager.getInstance().getModules());


    useEffect(() => {
        const updateModules = () => {
            setModules(new Map<string, OverfloatModule>(ModuleManager.getInstance().getModules()));
        };
        
        WindowEventHandler.getInstance();   
        ModuleManager.getInstance().subscribe(updateModules);
        
        invoke('watch_file', {path: "C:/Users/Urcier/linuxstuff/bp/test"}).then((res) => console.log(res));

        updateModules();

        return () => {
            ModuleManager.getInstance().unsubscribe(updateModules);
        };
    }, []);

    return (
        <div className="container">
            <div className="h2">Modules</div>
            {Array.from(modules).map(([name, module]) => (
                <div key={name}>
                    <ModuleDisplay module={module} />
                    <hr/>
                </div>
            ))}
        </div>
    );
};

export default ModuleWindow;
