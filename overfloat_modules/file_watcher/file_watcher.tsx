import { useEffect } from 'react';
import useState from 'react-usestateref';
import { appWindow } from '@tauri-apps/api/window';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { TitleBar } from '../../src/services/TitleBar';
import { watchPath } from '../../src/services/api';

const FileWatcher = () => {
    useEffect(() => {
        appWindow.show();
        const unlisten = listen('overfloat://FileChange', (event) => handle_file_change(event));

        return () => {
            unlisten.then(f => f())
        }
    }, [])

    const [path, setPath, pathRef] = useState<string>("");
    const [info, setInfo] = useState<string>("");

    const set_file = async () => {
        const selected_file = await open({
            directory: true,
            multiple: false,
            title: "Select a folder to monitor."
        })
        if (selected_file == null || Array.isArray(selected_file)) return;
        setPath(selected_file);
        watchPath("test", selected_file, ()=>{});
    }

    const handle_file_change = (event: any) => {
        if (event.payload.path == pathRef.current) {
            setInfo("Folder changed at: " + new Date().toLocaleTimeString());
        }
    }

    return (
        <div>
            <TitleBar />
            <div className='container'>
                <div className="row">
                    <div className="col">Watching Folder: {path}</div>
                </div>
                <div className="row">
                    <button onClick={set_file}>Select Folder</button>
                </div>
                <div className="row">
                    <div className="col">{info}</div>
                </div>
            </div>
        </div>
    )

}


export default FileWatcher;
