import 'react';
import { useEffect } from 'react';
import { emit, listen } from '@tauri-apps/api/event';
import { WebviewWindow } from '@tauri-apps/api/window';

import Central from './components/central';
import Counter from './components/counter';

type KeypressEvent = {
  payload: {
      message: string
  }
};

type CreateWindowEvent = {
  payload: {
    title: string,
    id : string,
    path: string,
  }
};

const Overfloat = () => {

  const new_window = (title: string, id: string, path: string) => {
    const webview = new WebviewWindow(id, { url: 'http://localhost:1420/' + path, visible: true, height: 300, width: 500, alwaysOnTop: true, decorations: true, title: title});
    webview.once('tauri://created', () => { console.log('Window ' + id + ' created')});
    webview.once('tauri://error', function (e) { console.log(e) });
  };

  const keypress_handler = (event : KeypressEvent) => {
    console.log(event); 
    emit("overfloat://KeybindPropagation", { message: event.payload.message.split('(')[0]});
  };

  const create_window_handler = (event : CreateWindowEvent) => {
    console.log(event);
    new_window(event.payload.title, event.payload.id, event.payload.path);
  }

  useEffect(() => {
    const unlisten_keypress = listen('overfloat://GlobalKeyPress', (event : KeypressEvent) => keypress_handler(event));
    const unlisten_create_window = listen('overfloat://CreateWindow', (event : CreateWindowEvent) => create_window_handler(event));
      
    return () => {
      unlisten_keypress.then(f => f());
    }
  }, []);


  return (
    <div>This is the main background window</div>
  );
}

export default Overfloat;