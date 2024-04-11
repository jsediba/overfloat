import { TitleBar } from "../../src/services/TitleBar";
import { openSubwindow } from "../../src/services/api";

const FSTester: React.FC = () => {

    return(
        <div>
            <TitleBar/>
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
        </div>
    )
}

export default FSTester;