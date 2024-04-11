import { useState } from "react";
import { TitleBar } from "../../src/services/TitleBar";
import { clipboardRead, clipboardWrite } from "../../src/services/api";

const ClipboardTester: React.FC = () => {
    const [targetContent, setTargetContent] = useState<string>("");
    const [clipboardContent, setClipboardContent] = useState<string>("");

    return (
        <div>
            <TitleBar />
            <div className="container text-center">
                <div className="row">
                    <textarea className="col-10"
                        onChange={(event) => setTargetContent(event.target.value)}
                        placeholder="Content to be written into clipboard"
                        cols={300} rows={1} />
                    <button className="btn btn-primary col-2"
                        onClick={() => clipboardWrite(targetContent)}>
                        Set
                    </button>
                </div>
                <hr />
                <div className="row">
                    <button className="btn btn-primary col"
                        onClick={() => clipboardRead().then((content) => setClipboardContent(content))}>
                        Get
                    </button>
                </div>
                <div className="row">
                    <pre>
                        {clipboardContent}
                    </pre>
                </div>
            </div>
        </div>
    )
}

export default ClipboardTester;