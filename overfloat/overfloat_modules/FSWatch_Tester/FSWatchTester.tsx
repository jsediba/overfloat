/*****************************************************************************
 * @FilePath    : overfloat_modules/FSWatch_Tester/FSWatchTester.tsx         *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect } from "react";
import useState from "react-usestateref";
import { open } from "@tauri-apps/api/dialog";
import { ModuleWindow, WatchManager, FSEvent } from "@OverfloatAPI";
import EventDisplay from "./components/EventDisplay";

const FSWatchTester = () => {
    useEffect(() => {

    }, []);

    const [path, setPath] = useState<string>("");
    const [info, setInfo] = useState<FSEvent[]>([

    ]);

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

    const handle_file_change = (event: FSEvent) => {
        setInfo((prev: FSEvent[]) => [event, ...prev]);
    };

    return (
        <ModuleWindow>
            <div className="container">
                <div className="row">
                    <div className="col-10">Watching Folder: {path}</div>
                    <button
                        className={
                            "btn btn-primary col-2" +
                            (path == "" ? " d-none" : "")
                        }
                        onClick={() => {
                            WatchManager.stopWatching("FSWatchTester"),
                                setPath("");
                        }}>
                        Stop
                    </button>
                </div>
                <div className="row">
                    <button onClick={selectFolder}>Select Folder</button>
                </div>
            </div>
            <hr />
            <div className="container">
                {info.map((event, index) => (
                    <EventDisplay key={index} event={event} />
                ))}
            </div>
        </ModuleWindow>
    );
};

export default FSWatchTester;
