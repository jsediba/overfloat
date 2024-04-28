/*****************************************************************************
 * @FilePath    : src/components/Modules/SubwindowDisplay.tsx                *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect, useState } from "react";
import { OverfloatModule, Window } from "../../utils/OverfloatModule";
import { IconMaximize, IconMinus, IconX } from "@tabler/icons-react";

type SubwindowDisplayProps = {
    module: OverfloatModule;
    window: Window;
};

/**
 * React component for the display of a subwindow of a module.
 */
const SubwindowDisplay: React.FC<SubwindowDisplayProps> = (
    props: SubwindowDisplayProps
) => {
    const module = props["module"];
    const window = props["window"];

    const [title, setTitle] = useState<string>(window.webview.label);

    useEffect(() => {
        // Update the displayed name of the subwindow to it's title on mount
        window.webview.title().then((title) => setTitle(title));
    }, []);

    return (
        <div className="row">
            <div className="col-10">{title}</div>
            <div className="col-2">
                <div className="btn-group">
                    {/* Toggle window visibility button */}
                    <button
                        className="windowControlButton"
                        onClick={() => {
                            if (window.visible) {
                                module.hideSubwindow(window.webview.label);
                            } else {
                                module.showSubwindow(window.webview.label);
                            }
                        }}
                        title={(window.visible?"Hide" : "Show") + " Window"}>
                        {window.visible ? <IconMinus /> : <IconMaximize />}
                    </button>

                    {/* Close window button */}
                    <button
                        className="windowControlButton"
                        onClick={() => {
                            module.closeSubwindow(window.webview.label);
                        }}
                        title="Close Window">
                        <IconX />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubwindowDisplay;
