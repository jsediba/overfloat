import { useEffect, useState } from "react";
import { Shortcut } from "../../utils/Shortcut";
import KeybindDisplay from "./KeybindDisplay";
import { KeybindManager } from "../../utils/KeybindManager";

interface ShortcutDisplayProps {
    moduleName: string;
    shortcut: Shortcut;
}

const ShortcutDisplay: React.FC<ShortcutDisplayProps> = (
    props: ShortcutDisplayProps
) => {
    const moduleName: string = props["moduleName"];
    const shortcut: Shortcut = props["shortcut"];

    const [boundKeys, setBoundKeys] = useState<string[]>([...shortcut.getBoundKeys()]);
    const [newKeybind, setNewKeybind] = useState<string>("");

    useEffect(() => { 
        const updateBoundKeys = () => {
            setBoundKeys([...shortcut.getBoundKeys()]);
        }

        updateBoundKeys();
        KeybindManager.getInstance().subscribe(updateBoundKeys);

        return () => {
            KeybindManager.getInstance().unsubscribe(updateBoundKeys);
        }
    }, []);

    return (
        <div className="container">
            <div className="row">
                <div className="col-2">{shortcut.getName()}</div>
                <div className="col-6">{shortcut.getDescription()}</div>
                <div className="col-4">
                    <div className="container-fluid">
                        {boundKeys.map((keybind, index) => (
                            <KeybindDisplay moduleName={moduleName} windowLabel={shortcut.getWindowLabel()}
                                keybind={keybind} position={index} key={index} id={shortcut.getId()} />
                        ))}
                        <div className="row">
                            <input className="col-8" type="text" value={newKeybind} placeholder="New Keybind" onChange={(event) => setNewKeybind(event.target.value)} />

                            <button className="btn btn-primary col-4" onClick={() => {
                                KeybindManager.getInstance().addKeybind(moduleName, shortcut.getWindowLabel(), shortcut.getId(), newKeybind);
                                setNewKeybind("");
                            }}>
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <hr />
        </div>
    );
};

export default ShortcutDisplay;
