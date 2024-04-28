/*****************************************************************************
 * @FilePath    : src/components/Modules/InactiveModuleDisplay.tsx           *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { IconPlayerPlayFilled } from "@tabler/icons-react";
import { ModuleManager } from "../../utils/ModuleManager";

type InactiveModuleDisplayProps = {
    moduleName: string;
}

/**
 * React component for the display of an inactive module.
 */
const InactiveModuleDisplay: React.FC<InactiveModuleDisplayProps> = (props: InactiveModuleDisplayProps) => {
    const moduleName = props["moduleName"];
    
    return(
        <div className="row">
            <div className="col-10">
                {moduleName}
            </div>
            <div className="col-2">
                {/* Start module button */}
                <button className="windowControlButton" onClick={()=>(ModuleManager.getInstance().startModule(moduleName))}
                title="Start Module">
                    <IconPlayerPlayFilled />
                </button>
            </div>
        </div>
    )
}

export default InactiveModuleDisplay;