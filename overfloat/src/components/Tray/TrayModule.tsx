/*****************************************************************************
 * @FilePath    : src/components/Tray/TrayModule.tsx                         *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect } from "react";
import useStateRef from "react-usestateref";
import { OverfloatModule } from "../../utils/OverfloatModule";
import "./css/TrayModule.css";
import TraySubwindows from "./TraySubwindows";
import TrayWindowIcon from "./TrayWindowIcon";

interface TrayModuleProps {
    module: OverfloatModule;
}

const TrayModule: React.FC<TrayModuleProps> = (props: TrayModuleProps) => {
    const module = props["module"];
    const containerName = module.getModuleName() + "-module-container";

    const [_, setVisible, refVisible] = useStateRef<boolean>(module.getMainWindow().visible);

    useEffect(() => {
        module.subscribe(() => setVisible(module.getMainWindow().visible));

        return () => {
            module.unsubscribe(() => setVisible(module.getMainWindow().visible));
        };
    }, []);

    const getModuleIconPath = () => {
        return "../overfloat_modules/" + module.getModuleName() + "/icons/icon.png";
    }

    return (
        <div
            id={containerName}
            className="module-container"
            >
            <button
                className={
                    refVisible.current
                        ? "module-button module-button-active text-truncate"
                        : "module-button module-button-inactive text-truncate"
                }
                title={module.getModuleName()}
                onClick={() => {
                    if (refVisible.current) module.hideMainWindow();
                    else module.showMainWindow();
                }}>
                <TrayWindowIcon webview={module.getMainWindow().webview} imgPath={getModuleIconPath()} />
            </button>
            <TraySubwindows module={module} containerId={containerName}/>
        </div>
    );
};

export default TrayModule;
