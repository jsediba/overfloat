import 'react';
import { useState, useEffect } from 'react'
import { listen } from '@tauri-apps/api/event'
import { appWindow } from '@tauri-apps/api/window'

type CounterProps = {
    keybind: string
}

const Counter = ({ keybind } : CounterProps) : React.JSX.Element =>  {
    useEffect(() => {
        appWindow.show();
    }, [])

    const [counter, setCounter] = useState<number>(0);

    const handle_keypress = async (event : any) => {
        if(event.payload == keybind){
            setCounter((prev : number)=>{console.log(prev); return (prev+1)});
        }
    }

    listen('overfloat://KeybindPropagation', (event) => handle_keypress(event));

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