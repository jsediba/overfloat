export type SerializedShortcut = {
    id: string,
    keybinds: string[],
}

export class Shortcut {
    private name: string;
    private windowLabel: string;
    private id: string;
    private description: string;
    private boundKeys: string[];

    public constructor(
        name: string,
        windowLabel: string,
        id: string,
        description: string,
        boundKeys: string[] = []
    ) {
        this.name = name;
        this.windowLabel = windowLabel;
        this.id = id;
        this.description = description;
        this.boundKeys = boundKeys;
    }

    public addKeybind(keybind: string) {
        this.boundKeys.push(keybind);
    }

    public removeKeybind(position: number): string | undefined {
        if (position < 0 || position >= this.boundKeys.length) return undefined;
        const tmp: string = this.boundKeys[position];
        this.boundKeys.splice(position, 1);
        return tmp;
    }

    public changeKeybind(
        position: number,
        keybind: string
    ): string | undefined {
        if (position < 0 || position >= this.boundKeys.length) return undefined;

        const tmp: string = this.boundKeys[position];

        if(this.boundKeys.includes(keybind)){
            this.boundKeys.splice(position, 1);
        } else {
            this.boundKeys[position] = keybind;
        }


        return tmp;
    }

    public getName(): string {
        return this.name;
    }

    public getWindowLabel(): string {
        return this.windowLabel;
    }

    public getId(): string {
        return this.id;
    }

    public getDescription(): string {
        return this.description;
    }

    public getBoundKeys(): string[] {
        return this.boundKeys;
    }

    public removeBoundKeys(){
        this.boundKeys = [];
    }

    private getShortcutIdSuffix(id: string): string{
        return id.replace(/.*\/([^/]*)/g, "$1");
    }


    public serializeShortcut(): SerializedShortcut{
        return {id: this.getShortcutIdSuffix(this.id), keybinds: this.boundKeys};
    }
}
