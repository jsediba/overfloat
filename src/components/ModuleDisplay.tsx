import { useState, useEffect } from 'react'
import { OverfloatModule } from './OverfloatModule';
import { WebviewWindow } from '@tauri-apps/api/window';
import { listen } from '@tauri-apps/api/event'


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
    
      const unlisten = listen('overfloat://GlobalKeyPress', () => {console.log(module.getSubwindows())});

      return () => {
          module.unsubscribe(updateModuleWindows);
          unlisten.then(f => f())
        }
    }, [])

    return (
        <div className='container'>
            <div>
                {mainWindow === null? "Main window is not open" : mainWindow.label}
            </div>
            <div className="container">

            {Array.from(subwindows).map(([key, window]) => (
                <div key={key}>
                    Id: {key}
                    Window Label: {window.label}
                </div>
            ))}
            </div>

        </div>
    );
};

export default ModuleDisplay;