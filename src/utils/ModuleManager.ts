import { OverfloatModule } from "./OverfloatModule";
import { invoke } from "@tauri-apps/api";

export class ModuleManager{
    private static instance: ModuleManager;
    private overfloatModules = new Map<string, OverfloatModule>();
    private subscribers: Set<Function>;
    
    private constructor(){
		this.subscribers = new Set<Function>();
        this.setupModules()
    }

    public subscribe(subscriber: Function): void {
        this.subscribers.add(subscriber);
      }
    
      public unsubscribe(subscriber: Function): void {
        this.subscribers.delete(subscriber);
      }
    
      private notifySubscribers(): void {
        console.log("Notifying subscribers");
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

    public static getInstance(): ModuleManager {
        if (!ModuleManager.instance) {
            console.log("Creating new ModuleManager at ", Date.now());
            ModuleManager.instance = new ModuleManager();
        }

        return ModuleManager.instance;
    }

}

