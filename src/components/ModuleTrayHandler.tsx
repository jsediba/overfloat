import { useState, useEffect } from 'react'
import { OverfloatModule } from './OverfloatModule';
import { ModuleManager } from './ModuleManager';
import ModuleDisplay from './ModuleDisplay';

const TrayHandler: React.FC = () => {
    const moduleManager = ModuleManager.getInstance();
    const [modules, setModules] = useState<Map<string, OverfloatModule>>(moduleManager.getModules());
  
    useEffect(() => {   
      const updateModules = () => {
        setModules(new Map<string, OverfloatModule>(moduleManager.getModules()));
      };
  
      moduleManager.subscribe(updateModules);
  
      return () => {
          moduleManager.unsubscribe(updateModules);
        }
    }, [])
     
    return (
        <div>
          <button onClick={() => modules.get('central')?.showMainWindow()}>Open Central</button>
      {Array.from(modules).map(([name, module]) => (
        <div key={name}>
            Module: {name}
            <ModuleDisplay module={module}/>
        </div>
      ))}
    </div>
    );
};

export default TrayHandler;