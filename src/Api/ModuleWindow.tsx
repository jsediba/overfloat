import { ReactNode } from "react";
import { TitleBar } from "./TitleBar";

type ModuleWindowProps = {
    children?: ReactNode;
}

export const ModuleWindow: React.FC<ModuleWindowProps> = ({ children }:ModuleWindowProps) => {
    return (
        <div>
            <TitleBar />
            <div className="module-content">
                {children}
            </div>
        </div>
    );
};