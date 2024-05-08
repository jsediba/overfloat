/*****************************************************************************
 * @FilePath    : overfloat_modules/Clipboard_Tester/ClipboardTester.tsx     *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useState } from "react";
import { clipboardRead, clipboardWrite, ModuleWindow } from "@OverfloatAPI";

/**
 * Main window of the module for testing clipboard read and write operations.
 */
const ClipboardTester: React.FC = () => {
    const [targetContent, setTargetContent] = useState<string>("");
    const [clipboardContent, setClipboardContent] = useState<string>("");

    return (
        <ModuleWindow>
            <div className="container-fluid text-center mt-2">
                {/* clipboardWrite controls */}
                <div className="row">
                    <div className="col-12">
                        <textarea
                            className="w-100"
                            onChange={(event) =>
                                setTargetContent(event.target.value)
                            }
                            placeholder="Content to be written into clipboard"
                            rows={3}
                        />
                    <button
                        className="btn btn-primary col-12 mt-0"
                        onClick={() => clipboardWrite(targetContent)}>
                        Set
                    </button>
                    </div>
                </div>
                <hr className="m-2" />
                {/* clipboardRead controls */}
                <button
                    className="btn col-auto btn-primary mb-2"
                    onClick={() =>
                        clipboardRead().then((content) =>
                            setClipboardContent(content)
                        )
                    }>
                    Get
                </button>
                <pre
                    className={"text-start border" + (clipboardContent === "" ? " d-none" : "")} 
                    style={{ minHeight: "10px" }}>
                    {clipboardContent}
                </pre>
            </div>
        </ModuleWindow>
    );
};

export default ClipboardTester;
