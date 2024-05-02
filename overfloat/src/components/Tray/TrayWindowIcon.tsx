/*****************************************************************************
 * @FilePath    : src/components/Tray/TrayWindowIcon.tsx                     *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useState, useEffect } from "react";
import { IconAppWindow } from "@tabler/icons-react";
import { WebviewWindow } from "@tauri-apps/api/window";
import { resolveResource } from "@tauri-apps/api/path";
import { convertFileSrc } from "@tauri-apps/api/tauri";

type TrayModuleIconProps = {
    imgPath: string;
    webview: WebviewWindow;
};

/**
 * React component for the icon of a tray module window.
 */
const TrayWindowIcon: React.FC<TrayModuleIconProps> = (
    props: TrayModuleIconProps
) => {
    const imgPath = props["imgPath"];
    const webview = props["webview"];

    // State for the title of the window and the icon element
    const [windowTitle, setWindowTitle] = useState<string>(webview.label);
    const [element, setElement] = useState<React.ReactNode>(
        <div title={windowTitle} className="w-100 h-100">
            <IconAppWindow className="w-75 h-75" />
        </div>
    );

    useEffect(() => {
        // Update the displayed name of the window to it's title on mount
        webview.title().then((title) => setWindowTitle(title));

        // Load the icon image from resources
        resolveResource(imgPath).then((path) => {
            const assetPath = convertFileSrc(path);

            const image = new Image();
            image.src = assetPath;
            image.onload = () => {
                setElement(
                    <div title={windowTitle} className="w-100 h-100">
                        <img
                            src={image.src}
                            alt={windowTitle}
                            className="h-75"
                        />
                    </div>
                );
            };
        });
    }, []);
    return <>{element}</>;
};

export default TrayWindowIcon;
