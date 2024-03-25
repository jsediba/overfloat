import { OverfloatModule } from "./OverfloatModule";
import { invoke } from "@tauri-apps/api";

class _ModuleManager{
    private static instance: _ModuleManager;
    private overfloatModules = new Map<string, OverfloatModule>();
    private subscribers: Set<Function>;
    
    private constructor(){
        this.setupModules()
        this.subscribers = new Set<Function>();
    }

    public subscribe(subscriber: Function): void {
        this.subscribers.add(subscriber);
      }
    
      public unsubscribe(subscriber: Function): void {
        this.subscribers.delete(subscriber);
      }
    
      private notifySubscribers(): void {
        for (const subscriber of this.subscribers) {
          subscriber();
        }
      }

    private async setupModules(){
        let module_names:string[] = await invoke('get_module_names');
        module_names.forEach((module:string) => {this.overfloatModules.set(module, new OverfloatModule(module))});
        this.notifySubscribers();
    }

    public getModules(): Map<string,OverfloatModule>{
        return this.overfloatModules;
    }

    public static getInstance(): _ModuleManager {
        if (!this.instance) {
            console.log("Creating new ModuleManager at ", Date.now());
            this.instance = new _ModuleManager();
        }

        return this.instance;
    }

}

export const ModuleManager = Object.freeze(_ModuleManager.getInstance());

