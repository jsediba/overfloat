import { useEffect } from "react";
import useStateRef from "react-usestateref";
import { OverfloatModule } from "../../utils/OverfloatModule";
import { Window } from "../../utils/OverfloatModule";
import "./css/TraySubwindows.css";
import TraySubwindow from "./TraySubwindow";
import { IconCaretDown, IconCaretUp } from "@tabler/icons-react";

interface TraySubwindowsProps {
    module: OverfloatModule;
    containerId: string;
}

const TraySubwindows: React.FC<TraySubwindowsProps> = (
    props: TraySubwindowsProps
) => {
    const module = props["module"];
    const containerId = props["containerId"];

    const [subwindows, setSubwindows, refSubwindows] = useStateRef<Map<string, Window>>(
        module.getSubwindows()
    );

    const [subwindowsVisible, setSubwindowsVisible, refSubwindowsVisible] =
        useStateRef<boolean>(false);

    const updateMinHeight = () => {
        const moduleContainer = document.getElementById(containerId);
        console.log("Container is:", moduleContainer);
        if (moduleContainer != null) {
            const height = Array.from(moduleContainer.children).reduce(
                (height, child) => height + child.clientHeight,
                0
            );
            
            if(refSubwindows.current.size == 0){
                moduleContainer.style.minHeight = "56px";
                return;
            }

            if (refSubwindowsVisible.current) {
                moduleContainer.style.minHeight = height + "px";
            } else {
                moduleContainer.style.minHeight = "76px";
            }
        }
    };

    useEffect(() => {
        const updateModuleSubwindows = () => {
            setSubwindows(new Map<string, Window>(module.getSubwindows()));
            updateMinHeight();
        };

        updateModuleSubwindows();
        module.subscribe(updateModuleSubwindows);

        return () => {
            module.unsubscribe(updateModuleSubwindows);
        };
    }, []);

    useEffect(() => {
        updateMinHeight();
    }, [subwindowsVisible]);

    if (subwindows.size == 0) {
        return null;
    } else {
        return (
            <div className="m-0">
                <button
                    className={
                        subwindowsVisible
                            ? "d-none"
                            : "toggle-subwindows-button"
                    }
                    onClick={() => {
                        setSubwindowsVisible(true);
                    }}>
                    <IconCaretDown color="white" size={20} />
                </button>
                <div className={subwindowsVisible ? "" : "d-none"}>
                    {Array.from(subwindows).map(([windowLabel, window]) => (
                        <TraySubwindow
                            key={windowLabel}
                            module={module}
                            windowLabel={windowLabel}
                            window={window}
                        />
                    ))}
                </div>
                <button
                    className={
                        subwindowsVisible
                            ? "toggle-subwindows-button"
                            : "d-none"
                    }
                    onClick={() => setSubwindowsVisible(false)}>
                    <IconCaretUp color="white" size={20} />
                </button>
            </div>
        );
    }
};

export default TraySubwindows;
