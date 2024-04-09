import { useEffect, useState } from "react";
import { OverfloatModule } from "../../utils/OverfloatModule";
import "./css/TrayModule.css";
import TraySubwindows from "./TraySubwindows";

interface TrayModuleProps {
    module: OverfloatModule;
}

const TrayModule: React.FC<TrayModuleProps> = (props: TrayModuleProps) => {
    const module = props["module"];
    const containerName = module.getModuleName()+"-module-container";

    const [, forceUpdate] = useState(false);
    const [minHeight, setMinHeight] = useState<number>(0);

    useEffect(() => {
        const moduleContainer = document.getElementById(containerName);
        if(moduleContainer != null){
            const height = Array.from(moduleContainer.children).reduce((height, child) => height + child.clientHeight, 0);
            setMinHeight(height);
        }
        module.subscribe(() => forceUpdate(previousState => !previousState));
    }, [])

    return (
        <div
            id={containerName}
            className="module-container" style={{minHeight: `${minHeight}px`}}>
            <button
                className={
                    module.getMainWindow().visible
                        ? "module-button module-button-active"
                        : "module-button module-button-inactive"
                }
                title={module.getModuleName()}
                onClick={() => {
                    if (module.getMainWindow().visible) module.hideMainWindow();
                    else module.showMainWindow();
                }}>
                {module.getModuleName().length <= 7
                    ? module.getModuleName()
                    : module.getModuleName().substring(0, 4) + "..."}
            </button>
            <TraySubwindows module={module} />
        </div>
    );
};

export default TrayModule;
