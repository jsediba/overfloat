/*****************************************************************************
 * @FilePath    : overfloat_modules/FS_Tester/FSTester.tsx                   *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { ModuleWindow, openSubwindow } from "@OverfloatAPI";

/**
 * Main window of the module for testing the FileSystem operations.
 */
const FSTester: React.FC = () => {
    return (
        <ModuleWindow>
            <div className="container text-center mt-2">
                <div className="row">
                    <button
                        className="btn btn-primary col m-2"
                        onClick={() =>
                            openSubwindow("WriteTester", "Write Tester")
                        }>
                        Open Write Tester
                    </button>
                    <button
                        className="btn btn-primary col m-2"
                        onClick={() =>
                            openSubwindow("ReadTester", "Read Tester")
                        }>
                        Open Read Tester
                    </button>
                </div>
            </div>
        </ModuleWindow>
    );
};

export default FSTester;
