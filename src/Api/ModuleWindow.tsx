/*****************************************************************************
 * @FilePath    : src/Api/ModuleWindow.tsx                                   *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { ReactNode } from "react";
import { TitleBar } from "./TitleBar";
import "./css/ModuleWindow.css";

type ModuleWindowProps = {
    showTitleBar?: boolean;
    children?: ReactNode;
}

/**
 * React component for the display of a module window.
 */
export const ModuleWindow: React.FC<ModuleWindowProps> = (props:ModuleWindowProps) => {
    const showTitleBar = props["showTitleBar"] == undefined ? true : props["showTitleBar"];
    const children = props["children"];
    
    return (
        <div>
            {showTitleBar && <TitleBar />}
            <div className="module-content">
                {children}
            </div>
        </div>
    );
};