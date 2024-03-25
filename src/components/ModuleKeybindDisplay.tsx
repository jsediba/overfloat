import { useEffect } from 'react'
import { Shortcut } from '../utils/KeybindManager';

interface ModuleKeybindDisplayProps {
    shortcuts: Map<string, Shortcut>;
}


const ModuleKeybindDisplay: React.FC<ModuleKeybindDisplayProps> = (props: ModuleKeybindDisplayProps) => {  
    const shortcuts = props['shortcuts']
  
    useEffect(() => {     
    }, [])

    return (
        <div className='container'>
            {Array.from(shortcuts).map(([id, shortcut]) => (
                <div key={id}>
                    id: {shortcut.id}
                    Name: {shortcut.name}
                    Description: {shortcut.description}
                </div>
            ))}
        </div>
    );
};

export default ModuleKeybindDisplay;