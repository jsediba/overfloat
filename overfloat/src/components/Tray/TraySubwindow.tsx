/*****************************************************************************
 * @FilePath    : src/components/Tray/TraySubwindow.tsx                      *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect, useState } from "react";
import { OverfloatModule, Window } from "../../utils/OverfloatModule";
import "./css/Tray.css"
import TrayWindowIcon from "./TrayWindowIcon";

type TraySubwindowProps = {
    module: OverfloatModule;
    windowLabel: string;
    window: Window;
};

const TraySubwindow: React.FC<TraySubwindowProps> = (
    props: TraySubwindowProps
) => {
    const module = props["module"];
    const windowLabel = props["windowLabel"];
    const window = props["window"];

    const [title, setTitle] = useState<string>(window.webview.label);

    useEffect(() => {
        window.webview.title().then(title => setTitle(title))
    }, []);

    const getComponentIconPath = () => {
        return "../overfloat_modules/" + module.getModuleName() + "/icons/" + window.subwindowName + ".png";
    };

    return (
        <button className={
                window.visible
                    ? "subwindow-button subwindow-button-active text-truncate px-1"
                    : "subwindow-button subwindow-button-inactive text-truncate px-1"
                }
                title={title}
                onClick={() => {
                    if (window.visible) module.hideSubwindow(windowLabel);
                    else module.showSubwindow(windowLabel);
                }}>
                
                <TrayWindowIcon webview={window.webview} imgPath={getComponentIconPath()} />
        
        </button>
    )
};

export default TraySubwindow;