import 'react';
import { useState, useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import { appWindow } from '@tauri-apps/api/window'


const Counter = () : React.JSX.Element =>  {
    useEffect(() => {
        appWindow.show();
        
        const unlisten = listen('overfloat://KeybindPropagation', (event) => handle_keypress(event));
        //register('A', () => {console.log("TauriGlobalShortcuts: A"); invoke('send_a');})
        console.log(appWindow.label)

        return () => {
            unlisten.then(f => f())
        }
    }, [])
    
    const queryParameters = new URLSearchParams(window.location.search);
    const [keybind, setKeybind] = useState<string|null>(queryParameters.get("keybind"));
    const [counter, setCounter] = useState<number>(0);

    const handle_keypress = async (event : any) => {
        console.log(event)
        if(event.payload.message == keybind){
            setCounter((prev : number)=>{console.log(prev); return (prev+1)});
        }
    }

    

    return (
        <div className='container'>
            <div className='row'>
                <div className='col'>
                    Counting presses of [{keybind}]
                </div>
            </div>
            <div className='row'>
                <div className='col'>
                    {counter}
                </div>
            </div>
        </div>
    );
};

export default Counter;