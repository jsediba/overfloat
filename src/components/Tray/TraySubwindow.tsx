import { useEffect, useState } from "react";
import { OverfloatModule, Window } from "../../utils/OverfloatModule";
import "./css/TraySubwindow.css"

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

    return (
        <button
                className={
                    window.visible
                        ? "subwindow-button subwindow-button-active"
                        : "subwindow-button subwindow-button-inactive"
                }
                title={title}
                onClick={() => {
                    if (window.visible) module.hideSubwindow(windowLabel);
                    else module.showSubwindow(windowLabel);
                }}>
                {title.length <= 7
                    ? title
                    : title.substring(0, 4) + "..."}
            </button>
    )
};

export default TraySubwindow;