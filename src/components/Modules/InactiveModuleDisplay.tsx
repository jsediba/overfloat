import { ModuleManager } from "../../utils/ModuleManager";

type InactiveModuleDisplayProps = {
    moduleName: string;
}

const InactiveModuleDisplay: React.FC<InactiveModuleDisplayProps> = (props: InactiveModuleDisplayProps) => {
    const moduleName = props["moduleName"];
    
    return(
        <div className="row">
            <div className="col-10">
                {moduleName}
            </div>
            <div className="col-2">
                <button className="btn btn-primary" onClick={()=>(ModuleManager.getInstance().startModule(moduleName))}>
                    Start
                </button>
            </div>
        </div>
    )
}

export default InactiveModuleDisplay;