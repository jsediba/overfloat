/*****************************************************************************
 * @FilePath    : src/utils/Shortcut.ts                                      *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

// Types for serialized shortcuts
export type SerializedShortcut = {
    id: string;
    keybinds: string[];
};

/**
 * @brief Class representing a single shortcut
 */
export class Shortcut {
    private name: string;
    private windowLabel: string;
    private id: string;
    private description: string;
    private boundKeys: string[];

    /**
     * @brief Constructor for the Shortcut class
     * @param name Name of the shortcut
     * @param windowLabel Label of the window the shortcut belongs to
     * @param id ID of the shortcut
     * @param description Description of the shortcut
     * @param boundKeys Keys bound to the shortcut
     */
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

    /**
     * @brief Adds a keybind to the shortcut
     * @param keybind Keybind to be added
     */
    public addKeybind(keybind: string) {
        this.boundKeys.push(keybind);
    }

    /**
     * @brief Removes a keybind from the shortcut
     * @param position Index of the keybind to be removed
     * @returns The removed keybind
     */
    public removeKeybind(position: number): string | undefined {
        // Check if the index is valid
        if (position < 0 || position >= this.boundKeys.length) return undefined;

        // Store the keybind to be removed and remove it
        const tmp: string = this.boundKeys[position];
        this.boundKeys.splice(position, 1);

        return tmp;
    }

    /**
     * @brief Changes a keybind of the shortcut
     * @param position Index of the keybind to be changed
     * @param keybind New keybind
     * @returns The old keybind
     */
    public changeKeybind(
        position: number,
        keybind: string
    ): string | undefined {
        // Check if the index is valid
        if (position < 0 || position >= this.boundKeys.length) return undefined;

        // Store the old keybind, and replace it with the new one
        const tmp: string = this.boundKeys[position];
        this.boundKeys[position] = keybind;

        return tmp;
    }

    /**
     * @brief Gets the name of the shortcut
     * @returns Name of the shortcut
     */
    public getName(): string {
        return this.name;
    }

    /**
     * @brief Gets the label of the window the shortcut belongs to
     * @returns Label of the window
     */
    public getWindowLabel(): string {
        return this.windowLabel;
    }

    /**
     * @brief Gets the ID of the shortcut
     * @returns ID of the shortcut
     */
    public getId(): string {
        return this.id;
    }

    /**
     * @brief Gets the description of the shortcut
     * @returns Description of the shortcut
     */
    public getDescription(): string {
        return this.description;
    }

    /**
     * @brief Gets the keys bound to the shortcut
     * @returns Array of bound keys
     */
    public getBoundKeys(): string[] {
        return this.boundKeys;
    }

    /**
     * @brief Removes all bound keys from the shortcut
     */
    public removeBoundKeys() {
        this.boundKeys = [];
    }

    /**
     * @brief Extracts the suffix of the shortcut ID
     * @param id ID of the shortcut
     * @returns Suffix of the ID without the module name and window label
     */
    private getShortcutIdSuffix(id: string): string {
        return id.replace(/.*\/([^/]*)/g, "$1");
    }

    /**
     * @brief Serializes the shortcut
     * @returns Serialized version of the shortcut
     */
    public serializeShortcut(): SerializedShortcut {
        return {
            id: this.getShortcutIdSuffix(this.id),
            keybinds: this.boundKeys,
        };
    }
}
