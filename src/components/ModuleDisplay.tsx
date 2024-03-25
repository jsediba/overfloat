import { useState, useEffect } from 'react'
import { OverfloatModule } from '../utils/OverfloatModule';
import { WebviewWindow } from '@tauri-apps/api/window';


interface ModuleDisplayProps {
    module: OverfloatModule;
}


const ModuleDisplay: React.FC<ModuleDisplayProps> = (props: ModuleDisplayProps) => {  
    const module = props['module']

    const [mainWindow, setMainWindow] = useState<WebviewWindow|null>(module.getMainWindow());
    const [subwindows, setSubwindows] = useState<Map<string, WebviewWindow>>(module.getSubwindows());
  
    useEffect(() => {   
      const updateModuleWindows = () => {
        setMainWindow(module.getMainWindow());
        setSubwindows(new Map<string, WebviewWindow>(module.getSubwindows()));
    };
  
      module.subscribe(updateModuleWindows);
    
      return () => {
          module.unsubscribe(updateModuleWindows);
        }
    }, [])

    return (
        <div className='container'>
            <div>
                {mainWindow === null? "Main window is not open" : mainWindow.label}
            </div>
            <div className="container">

            {Array.from(subwindows).map(([label, window]) => (
                <div key={label}>
                    Id: {label}
                    Window Label: {window.label}
                </div>
            ))}
            </div>

        </div>
    );
};

export default ModuleDisplay;