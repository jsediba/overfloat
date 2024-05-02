/*****************************************************************************
 * @FilePath    : overfloat_modules/Clipboard_Tester/ClipboardTester.tsx     *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useState } from "react";
import { clipboardRead, clipboardWrite, ModuleWindow } from "@OverfloatAPI";


const ClipboardTester: React.FC = () => {
    const [targetContent, setTargetContent] = useState<string>("");
    const [clipboardContent, setClipboardContent] = useState<string>("");

    return (
        <ModuleWindow>
            <div className="container text-center">
                <div className="row">
                    <textarea
                        className="col-10"
                        onChange={(event) =>
                            setTargetContent(event.target.value)
                        }
                        placeholder="Content to be written into clipboard"
                        cols={300}
                        rows={1}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => clipboardWrite(targetContent)}>
                        Set
                    </button>
                </div>
                <hr />
                <div className="row">
                    <button
                        className="btn btn-primary col"
                        onClick={() =>
                            clipboardRead().then((content) =>
                                setClipboardContent(content)
                            )
                        }>
                        Get
                    </button>
                </div>
                <div className="row">
                    <pre>{clipboardContent}</pre>
                </div>
            </div>
        </ModuleWindow>
    );
};

export default ClipboardTester;
