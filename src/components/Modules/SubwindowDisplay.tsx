import { useEffect, useState } from "react";
import { OverfloatModule, Window } from "../../utils/OverfloatModule";

type SubwindowDisplayProps = {
    module: OverfloatModule;
    window: Window;
};

const SubwindowDisplay: React.FC<SubwindowDisplayProps> = (
    props: SubwindowDisplayProps
) => {
    const module = props["module"];
    const window = props["window"];

    const [title, setTitle] = useState<string>(window.webview.label);

    useEffect(() => {
        window.webview.title().then((title) => setTitle(title));
    }, []);

    return (
        <div className="row">
            <div className="col-10">{title}</div>
            <div className="col-1">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        if (window.visible) {
                            module.hideSubwindow(window.webview.label);
                        } else {
                            module.showSubwindow(window.webview.label);
                        }
                    }}>
                    {window.visible ? "Hide" : "Show"}
                </button>
            </div>
            <div className="col-1">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        module.closeSubwindow(window.webview.label);
                    }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default SubwindowDisplay;
