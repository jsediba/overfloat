import { useState } from "react";
import { FSResult, writeFile } from "../../../src/Api/api";
import { ModuleWindow } from "../../../src/Api/ModuleWindow";

const WriteTester: React.FC = () => {
    const [result, setResult] = useState<FSResult | undefined>();
    const [content, setContent] = useState<string>("");
    const [path, setPath] = useState<string>("");
    const [isRelative, setIsRelative] = useState<boolean>(false);
    const [appendMode, setAppendMode] = useState<boolean>(false);

    return (
        <ModuleWindow>
            <div className="container">
                <div className="row m-2">
                    <input
                        type="text"
                        className="col"
                        onChange={(event) => setPath(event.target.value)}
                        placeholder="Path"
                    />
                </div>
                <div className="row m-2">
                    <textarea
                        className="col"
                        onChange={(event) => setContent(event.target.value)}
                        placeholder="Content to be written into file"
                        cols={300}
                        rows={1}
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
                    <div className="col">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            onChange={(event) =>
                                setAppendMode(event.target.checked)
                            }
                        />
                        {" Append Mode"}
                    </div>
                </div>
                <div className="row m-2">
                    <button
                        className="btn btn-primary col"
                        onClick={() =>
                            writeFile(
                                content,
                                path,
                                isRelative,
                                appendMode
                            ).then((result) => setResult(result))
                        }>
                        Write
                    </button>
                </div>
                <hr />
                {result != undefined && (
                    <div>
                        <div className="row">
                            <div className="col-2">Successful:</div>
                            <div className="col">
                                {result.successful.toString()}
                            </div>
                        </div>
                        <div className="row">
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

export default WriteTester;
