import 'react';
import { useEffect } from 'react';
import { WebviewWindow } from '@tauri-apps/api/window';
import { emit, listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

const Central = () => {
    const newWindow = (keybind: string) => {
        const webview = new WebviewWindow("counter_"+keybind, { url: 'http://localhost:1420/' + "counter?keybind="+keybind, visible: false, height: 100, width: 200, alwaysOnTop: true, decorations: true, title: '['+keybind+']'});
        webview.once('tauri://created', () => { console.log('Window ' + ("counter_"+keybind) + ' created')});
        webview.once('tauri://error', function (e) { console.log(e) });
    };

    useEffect(() => {
        const unlisten = listen('overfloat://GlobalKeyPress', (event) => { console.log(event); emit("overfloat://KeybindPropagation", { message: event.payload.message.split('(')[0]})});
        
        return () => {
          unlisten.then(f => f());
        }
    }, [])

    const handleKeyPress = async (e : KeyboardEvent) => {
        invoke ('setup_keybinds');
        emit('', e.key);
    }


    return (
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    Test Control Central
                </div>
            </div>
            <div className='row'>
                <div className='col'>
                    <button onClick={() => newWindow('A')}>[a]</button>
                </div>
                <div className='col'>
                    <button onClick={() => newWindow('S')}>[s]</button>
                </div>
            </div>
            <div className='row'>
                <div className='col'>
                    <button onClick={() => newWindow('D')}>[d]</button>
                </div>
                <div className='col'>
                    <button onClick={() => newWindow('F')}>[f]</button>

                </div>
            </div>
        </div>
    )
}

export default Central;