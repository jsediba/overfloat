/*****************************************************************************
 * @FilePath    : overfloat_modules/PoE_Trade/PoE_Trade.tsx                  *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useState, useEffect } from "react";
import useStateRef from "react-usestateref";
import { open } from "@tauri-apps/api/dialog";
import {
    ModuleWindow,
    openSubwindow,
    writeFile,
    readFile,
} from "@OverfloatAPI";

/**
 * Main window of the module for trading in Path of Exile.
 */
const PoETrade: React.FC = () => {
    const [path, setPath, refPath] = useStateRef<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Function to select the client.txt path and save it to the disk.
    const selectClientPath = async () => {
        const selectedFile = await open({
            directory: false,
            multiple: false,
            title: "Select the PoE Client.txt.",
        });
        if (selectedFile == null || Array.isArray(selectedFile)) return;
        setPath(selectedFile);
        const writeResult = await writeFile(
            selectedFile,
            "ClientPath.txt",
            true,
            false
        );
        if (writeResult.successful == false) {
            setErrorMessage(
                "Failed to save Client.txt path to the disk: " +
                    writeResult.path
            );
        } else {
            setErrorMessage(null);
        }
    };

    useEffect(() => {
        // Attempt to load the client.txt path from the disk.
        const getClientPath = async () => {
            const readResult = await readFile("ClientPath.txt", true);

            if (readResult.successful == true) {
                setPath(readResult.message);
                return;
            }

            setErrorMessage(
                "Failed to load Client.txt path to the disk: " +
                    readResult.message
            );
        };

        getClientPath();
    }, []);

    return (
        <ModuleWindow>
            <div className="container">
                {errorMessage != null ? (
                    <div className="row text-danger text-center pt-1">
                        <div className="col">{errorMessage}</div>
                    </div>
                ) : (
                    <div className="row text-success text-center pt-1">
                        <div className="col">
                            Client.txt path loaded successfully
                        </div>
                    </div>
                )}
                <hr></hr>
                <div className="row">
                    <div className="col">Selected client.txt path:</div>
                </div>
                <div className="row">
                    <div className="col">{path}</div>
                </div>
                <div className="row text-center pt-1">
                    <div className="col">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                selectClientPath();
                            }}>
                            Change Client Path
                        </button>
                    </div>
                </div>
                <hr></hr>
                <div className="row text-center">
                    <div className="col text-center">
                        <button
                            className="btn btn-success"
                            disabled={refPath.current == null}
                            onClick={() => {
                                if (refPath.current == null) return;
                                openSubwindow(
                                    "TradeWindow",
                                    "Trade Window",
                                    {
                                        clientPath: refPath.current,
                                    },
                                    { transparent: true }
                                );
                            }}>
                            Open Trading Window
                        </button>
                    </div>
                </div>
            </div>
        </ModuleWindow>
    );
};

export default PoETrade;
