/*****************************************************************************
 * @FilePath    : overfloat_modules/FSWatch_Tester/FSWatchTester.tsx         *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import { ModuleWindow, WatchManager, FSEvent } from "@OverfloatAPI";
import EventDisplay from "./components/EventDisplay";

/**
 * Main window of the module for testing the FileSystem Monitoring.
 */
const FSWatchTester: React.FC = () => {
    const [path, setPath] = useState<string>("");
    const [info, setInfo] = useState<FSEvent[]>([]);

    // Function to select a folder to monitor and start monitoring it.
    const selectFolder = async () => {
        const selectedFolder = await open({
            directory: true,
            multiple: false,
            title: "Select a folder to monitor.",
        });
        if (selectedFolder == null || Array.isArray(selectedFolder)) return;
        setPath(selectedFolder);
        WatchManager.watchPath(
            "FSWatchTester",
            selectedFolder,
            handle_file_change
        );
    };

    // Function to add the new event into the list.
    const handle_file_change = (event: FSEvent) => {
        setInfo((prev: FSEvent[]) => [event, ...prev]);
    };

    return (
        <ModuleWindow>
            {/* Controls to pick the folder or stop the monitoring */}
            <div className="container-fluid" style={{minWidth:"450px"}}>
                <div className="row mb-1 align-items-center  px-2">
                    <div className="col">Watching folder: {path}</div>
                    <button
                        className={
                            "btn btn-primary col-auto" +
                            (path == "" ? " d-none" : "")
                        }
                        onClick={() => {
                            WatchManager.stopWatching("FSWatchTester"),
                                setPath("");
                        }}>
                        Stop
                    </button>
                </div>
                <div className="row px-2">
                    <button
                        className="btn btn-secondary"
                        onClick={selectFolder}>
                        Select Folder
                    </button>
                </div>
            </div>
            <hr />
            {/* Display of the events */}
            <div className="container-fluid mb-2" style={{minWidth:"450px"}} >
                {info.map((event, index) => (
                    <EventDisplay key={index} event={event} />
                ))}
            </div>
        </ModuleWindow>
    );
};

export default FSWatchTester;
