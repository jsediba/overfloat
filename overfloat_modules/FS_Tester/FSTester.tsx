import { ModuleWindow } from "../../src/Api/ModuleWindow";
import { openSubwindow } from "../../src/Api/api";

const FSTester: React.FC = () => {
    return(
        <ModuleWindow>
            <div className="container text-center">
                <div className="row">
                    <div className="col">
                        <button className="btn btn-primary"
                        onClick={()=>openSubwindow(
                            "WriteTester",
                            "Write Tester"
                        )}>
                            Open Write Tester
                        </button>
                    </div>
                    <div className="col">
                        <button className="btn btn-primary"
                        onClick={()=>openSubwindow(
                            "ReadTester",
                            "Read Tester"
                        )}>
                            Open Read Tester
                        </button>
                    </div>
                </div>
            </div>
        </ModuleWindow>
    )
}

export default FSTester;