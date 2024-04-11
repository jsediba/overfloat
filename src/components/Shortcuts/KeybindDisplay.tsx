import { useState } from "react";
import { KeybindManager } from "../../utils/KeybindManager";

type KeybindDisplayProps = {
    moduleName: string,
    windowLabel: string,
    id: string,
    position: number,
    keybind: string
}

const KeybindDisplay: React.FC<KeybindDisplayProps> = (props: KeybindDisplayProps) => {
    const moduleName = props["moduleName"];
    const windowLabel = props["windowLabel"];
    const id = props["id"];
    const position = props["position"];

    const [keybind, setKeybind] = useState<string>(props["keybind"]);

    return (
        <div className="row">
            <input className="col-8" type="text" value={keybind} placeholder="Key" onChange={(event) => setKeybind(event.target.value)} />
            
            <button className="btn btn-primary col-4" onClick={() => {
                KeybindManager.getInstance().changeKeybind(moduleName, windowLabel, id, position, keybind);
            }}>
                Save
            </button>
        </div>
    )
}

export default KeybindDisplay;