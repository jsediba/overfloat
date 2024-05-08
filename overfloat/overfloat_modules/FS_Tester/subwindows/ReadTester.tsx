/*****************************************************************************
 * @FilePath    : overfloat_modules/FS_Tester/subwindows/ReadTester.tsx      *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useState } from "react";
import { ModuleWindow, FSResult, readFile } from "@OverfloatAPI";

/**
 * Subwindow for testing the read operation.
 */
const ReadTester: React.FC = () => {
    const [result, setResult] = useState<FSResult | undefined>();
    const [path, setPath] = useState<string>("");
    const [isRelative, setIsRelative] = useState<boolean>(false);

    return (
        <ModuleWindow>
            <div className="container">
                {/* Parameter settings */}
                <div className="row m-2">
                    <input
                        type="text"
                        className="col"
                        onChange={(event) => setPath(event.target.value)}
                        placeholder="Path"
                    />
                </div>
                <div className="row text-center m-2">
                    <div className="col">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            onChange={(event) =>
                                setIsRelative(event.target.checked)
                            }
                        />
                        {" Relative Path"}
                    </div>
                </div>
                <div className="row m-2">
                    <button
                        className="btn btn-primary col"
                        onClick={() =>
                            readFile(path, isRelative).then((result) =>
                                setResult(result)
                            )
                        }>
                        Read
                    </button>
                </div>
                <hr />

                {/* Result display */}
                {result != undefined && (
                    <div>
                        <div className="row">
                            <div className="col-2">Successful:</div>
                            <div className="col">
                                {result.successful.toString()}
                            </div>
                        </div>
                        <div className="row text-break">
                            <div className="col-2">Path:</div>
                            <div className="col">{result.path}</div>
                        </div>
                        <div className="row">
                            <div className="col-2">Message:</div>
                            <div className="col">
                                <pre>{result.message}</pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ModuleWindow>
    );
};

export default ReadTester;
