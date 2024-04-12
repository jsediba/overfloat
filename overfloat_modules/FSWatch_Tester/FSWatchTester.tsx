import { useEffect } from 'react';
import useState from 'react-usestateref';
import { open } from '@tauri-apps/api/dialog';
import { TitleBar } from '../../src/services/TitleBar';
import { WatchManager, FSEvent } from '../../src/services/api';
import EventDisplay from './components/EventDisplay';

const FSWatchTester = () => {
    useEffect(() => {
        return () => { }
    }, [])

    const [path, setPath] = useState<string>("");
    const [info, setInfo] = useState<FSEvent[]>([]);

    const selectFolder = async () => {
        const selectedFolder = await open({
            directory: true,
            multiple: false,
            title: "Select a folder to monitor."
        })
        if (selectedFolder == null || Array.isArray(selectedFolder)) return;
        setPath(selectedFolder);
        WatchManager.watchPath("FSWatchTester", selectedFolder, handle_file_change);
    }

    const handle_file_change = (event: FSEvent) => {
        setInfo((prev: FSEvent[]) => [event, ...prev]);
    }

    return (
        <div style={{ overflow: "hidden" }}>
            <TitleBar />
            <div className='container'>
                <div className="row">
                    <div className={"col-10" + (path == "" ? " d-none" : "s")}>Watching Folder: {path}</div>
                    <button className="btn btn-primary col-2"
                        onClick={() => { WatchManager.stopWatching("FSWatchTester"), setPath("") }}>
                        Stop
                    </button>
                </div>
                <div className="row">
                    <button onClick={selectFolder}>Select Folder</button>
                </div>
            </div>
            <hr />
            <div className="container" style={{ overflowY: "auto" }}></div>
            {info.map((event, index) => (
                <EventDisplay key={index} event={event} />
            ))}
        </div>
    )

}

export default FSWatchTester;
