import { useEffect } from "react";
import { Shortcut } from "../../utils/Shortcut";

interface ShortcutDisplayProps {
    moduleName: string;
    shortcut: Shortcut;
}

const ShortcutDisplay: React.FC<ShortcutDisplayProps> = (
    props: ShortcutDisplayProps
) => {
    const moduleName: string = props["moduleName"];
    const shortcut: Shortcut = props["shortcut"];

    useEffect(() => {}, []);

    return (
        <div className="container">
            <div className="row">
                <div className="col-2">{shortcut.getName()}</div>
                <div className="col-8">{shortcut.getDescription()}</div>
                <div className="col-2">{shortcut.getBoundKeys()}</div>
            </div>
            <hr />
        </div>
    );
};

export default ShortcutDisplay;
