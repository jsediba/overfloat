import 'react'
import { WebviewWindow } from '@tauri-apps/api/window'

type OpenModuleProps = {
    module_name: string
}

const OpenModule = ({ module_name } : OpenModuleProps) : React.JSX.Element =>  {
    const newWindow = () => {
        const webview = new WebviewWindow(module_name, { url: 'http://localhost:1420/'+module_name, visible:false, height:200, width:400, alwaysOnTop:true, decorations:true, });
        webview.once('tauri://created', () => {console.log('Window '+ (module_name) + ' created')});
        webview.once('tauri://error', function(e) {console.log(e)} );
    };

    return (
        <button onClick={() => newWindow()}>{module_name}</button>
    );
};

export default OpenModule;