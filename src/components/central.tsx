import 'react';
import { useEffect } from 'react';
import { WebviewWindow } from '@tauri-apps/api/window';
import { emit } from '@tauri-apps/api/event';

const Central = () => {
    const newWindow = (keybind: string) => {
        const webview = new WebviewWindow("counter_"+keybind, { url: 'http://localhost:1420/' + "counter_"+keybind, visible: false, height: 100, width: 200, alwaysOnTop: true, decorations: true, title: '['+keybind+']'});
        webview.once('tauri://created', () => { console.log('Window ' + ("counter_"+keybind) + ' created')});
        webview.once('tauri://error', function (e) { console.log(e) });
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyPress)
    
        return () => {
          document.removeEventListener('keydown', handleKeyPress)
        }
    }, [])

    const handleKeyPress = async (e : KeyboardEvent) => {
        emit('overfloat://KeybindPropagation', e.key);
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
                    <button onClick={() => newWindow('a')}>[a]</button>
                </div>
                <div className='col'>
                    <button onClick={() => newWindow('s')}>[s]</button>
                </div>
            </div>
            <div className='row'>
                <div className='col'>
                    <button onClick={() => newWindow('d')}>[d]</button>
                </div>
                <div className='col'>
                    <button onClick={() => newWindow('f')}>[f]</button>

                </div>
            </div>
        </div>
    )
}

export default Central;