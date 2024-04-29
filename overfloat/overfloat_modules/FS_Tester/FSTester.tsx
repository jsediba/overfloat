/*****************************************************************************
 * @FilePath    : overfloat_modules/FS_Tester/FSTester.tsx                   *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/


import { ModuleWindow, openSubwindow } from "@OverfloatAPI";
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
                            "Read Tester",
                            {},
                            {transparent: true}
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