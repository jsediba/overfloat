import { useEffect } from 'react';
import useState from 'react-usestateref';
import { appWindow } from '@tauri-apps/api/window';
import { open } from '@tauri-apps/api/dialog';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';

const FileWatcher = () => {
    useEffect(() => {
        appWindow.show() ;
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
            title: "Select a file to monitor."
        })
        if(selected_file == null || Array.isArray(selected_file)) return;
        setPath(selected_file);
        invoke('watch_file', {path: selected_file});
    }

    const handle_file_change = (event:any) => {
        if(event.payload.path == pathRef.current){
            setInfo("File changed at: " + new Date().toLocaleTimeString());
        }
    }

    return (
        <div className='container'>
            <div className="row">
                <div className="col">Watching file: {path}</div>
            </div>
            <div className="row">
                <button onClick={set_file}>Select File</button>
            </div>
            <div className="row">
                <div className="col">{info}</div>
            </div>
        </div>
    )

}


export default FileWatcher;
