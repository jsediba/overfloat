import 'react';
import { useEffect } from 'react';
import { WebviewWindow } from '@tauri-apps/api/window';
import { emit, listen } from '@tauri-apps/api/event';
import { ModuleManager } from '../../src/utils/ModuleManager';



const Central = () => {

    const newWindow = (keybind: string) => {
        emit("Overfloat://SubwindowOpen", {componentName: "Counter", title: "Counter "+keybind, params:{keybind:keybind}});
    };


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