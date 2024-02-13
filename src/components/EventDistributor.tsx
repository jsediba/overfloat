import { emit, listen } from '@tauri-apps/api/event'
import { appWindow, WebviewWindow } from '@tauri-apps/api/window'


export class EventDistributor{
    private static instance: EventDistributor;
    private map;

    private constructor() {
        map = {};
        listen('overfloat://KeybindPress', (event) => this.keypress_handler(event));
    }

    private keypress_handler(event){
        console.log(this.map.keys);
        if(event.payload in this.map.keys){
            map[event.payload].emit('overfloat://KeybindPropagation', event.payload);
        }
    }

    public static getInstance(): EventDistributor {
        if (!EventDistributor.instance) {
            EventDistributor.instance = new EventDistributor();
        }

        return EventDistributor.instance;
    }

    public register_keybind(window : &WebviewWindow, keybind : string){
        this.map[keybind] = window;
    }


}