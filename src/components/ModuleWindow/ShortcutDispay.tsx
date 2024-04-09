import { useEffect } from "react";
import { Shortcut } from "../../utils/Shortcut";

interface ShortcutDisplayProps {
    shortcuts: Map<string, Shortcut>;
}

const ShortcutDisplay: React.FC<ShortcutDisplayProps> = (
    props: ShortcutDisplayProps
) => {
    const shortcuts: Map<string, Shortcut> = props["shortcuts"];

    useEffect(() => {}, []);

    return (
        <div className="container">
            {Array.from(shortcuts).map(([id, shortcut]) => (
                <div key={id}>
                    <div className="row">
                        <div className="col">{shortcut.getName()}</div>
                        <div className="col">{shortcut.getDescription()}</div>
                    </div>
                    <div className="row">{shortcut.getBoundKeys()}</div>
                    <hr />
                </div>
            ))}
        </div>
    );
};

export default ShortcutDisplay;
