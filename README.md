# Overfloat

[![License](https://img.shields.io/badge/license-GNU%20GPL3-blue.svg)](LICENSE)

A modular overlay system for Windows and Linux (X11) built using Tauri and React. Includes support for global keybinds, multi-window modules, file-system monitoring, and input simulation. Adding modules after installation is currently not supported.

## Table of Contents

-   [Installation](#installation)
-   [Usage](#usage)
-   [Module Structure](#module-structure)
-   [API](#api)
-   [Key Strings](#key-strings)
-   [Key Combination Strings](#key-combination-strings)
-   [Creating Windows](#creating-windows)
-   [License](#license)

## Disclaimer

To capture all global keypresses this application needs to be ran with administrator privileges on Windows.

## Installation

Installers can be downloaded from the `installers` directory. Afterwards they only need to be installed and can be run.

For the module development version, download the `overfloat` directory. Afterwards, run `yarn` to download the necessary node modules and you can start working on your modules. To run the application, use `yarn tauri:dev`. The installer for the currently used platform can be generated using `yarn tauri:build`, cross-platform compilation is not supported. 

## Usage

If you only want to use the pre installed modules, download the installer and install the app.

For module development, download the development version as described in [Installation](#installation). Modules are developed by creating a new folder in the `overfloat_modules` directory. These modules have to follow a specific [structure](#module-structure).

## Module Structure

Modules are represented by directories inside the `overfloat_modules` directory.
These modules must contain a main window and can contain any number of subwindows. The directory should be structured as follows:

-   `module_name/`
	-   `MainWindowFile.tsx`
	-   `subwindows/`
		-   `Subwindow1.tsx`
		-   `Subwindow2.tsx`
		-   ...
	-   `icons/`
		-   `icon.png`
		-   `Subwindow1.png`
		-   `Subwindow2.png`
		-   ...
	-   ...

The window .tsx files have to include and default export React functional components representing the content of the window. The names of these files can only contain alphanumerical characters, `-` and `_`.

The file names inside the `subwindow` directory represent the names of the subwindows used when working with the API. In the provided example, there would be two subwindows, one named `Subwindow1` and the other named `Subwindow2`.

The `icons` folder contains icons for the windows that are displayed in the module tray. The file containing the icon of the main window should be named `icon.png`. The files containing the icons for the subwindows should match the file names inside the `subwindows` directory. Using images of resolution 64x64px or greater is recommended.

## API

An API is provided to help with the development of modules. You can import functions and components from it using the `@OverfloatAPI` alias. The API consists of the following parts:

-   [Window API](#window-api)
-   [Clipboard API](#clipboard-api)
-   [File-System API](#file-system-api)
-   [Shortcut API](#shortcut-api)

### Window API

The Window API exposes the following types, interfaces and functions for window manipulation:

-   <a name="namevaluepairs"></a>`NameValuePairs`

    -   Interface for name-value pairs. Used when passing parameters to a new subwindow through the URL. Format is `{name1: value1, name2: value2}`

-   <a name="windowsettings"></a>`WindowSettings`

    -   Type for window settings. Used when opening a new subwindow.
    -   Fields:
        -   [optional] visible: boolean - Whether the window should start visible.
        -   [optional] transparent: boolean - Whether the window should be transparent.
        -   [optional] x: number - X coordinate of the window starting position.
        -   [optional] y: number - Y coordinate of the window starting position.
        -   [optional] height: number - Starting height of the window.
        -   [optional] width: number - Starting width of the window.

-   `showMainWindow()`

    -   Makes the main window of the module visible.

-   `hideMainWindow()`

    -   Minimizes the main window.

-   `closeMainWindow()`

    -   Closes the main window. This results in closing the entire module.

-   `openSubwindow(subwindowName, title, parameters, windowSettings)`

    -   Opens the subwindow.
    -   Parameters:
        -   subwindowName: string - Name of the subwindow. Refer to [Module Structure](#module-structure).
        -   [optional] title: string - Title to be set to the subwindow.
        -   [optional] parameters: [NameValuePairs](#namevaluepairs) - Parameters to be passed to the subwindow through the URL.
        -   [optional] windowSettings: [WindowSettings](#windowsettings) - Settings for the window.

-   `getParameter(name): string|undefined`

    -   Gets the value of a parameter set during subwindow creation from the URL.
    -   Parameters:
        -   name: string - Name of the parameter (key of the NameValuePairs).
    -   Returns:
        -   String value of the parameter if the parameter is present. Undefined otherwise.

-   `showSubwindow(label)`

    -   Sets a subwindow to visible. Only works on subwindows from the same module.
    -   Parameters:
        -   [optional] label: string - Label of the subwindow to show. If not set, the window from where this function was called is shown.

-   `hideSubwindow(label)`

    -   Minimizes a subwindow. Only works on subwindows from the same module.
    -   Parameters:
        -   [optional] label: string - Label of the subwindow to minimize. If not set, the window from where this function was called is minimized.

-   `closeSubwindow(label)`

    -   Closes a subwindow. Only works on subwindows from the same module.
    -   Parameters:
        -   [optional] label: string - Label of the subwindow to close. If not set, the window from where this function was called is closed.

-   `hideWindow()`

    -   Minimizes the window from which this function was called.

-   `closeWindow()`
    -   Closes the window from which this function was called. If this is called from the main window of a module, the entire module is closed.

### Clipboard API

The Clipboard API exposes the following functions for clipboard manipulation:

-   `async clipboardRead(): Promise<string>`

    -   Gets the most recent text from the clipboard.
    -   Returns:
        -   The most recent text from the clipboard or an empty string if the clipboard is empty.

-   `async clipboardWrite(text:string)`
    -   Writes text into the clipboard.
    -   Parameters:
        -   text: string - Text to be written into the clipboard.

### File-System API

The File-System API exposes the following enums, types and functions for file-system operations:

- <a name="fseventkind"></a>`FSEventKind`
	- Enum for types of file-system events.
	- Values:
		- Create - Event signalling file/folder creation.
		- Remove - Event signalling file/folder deletion.
		- Modify - Event signalling file/folder content modification.
		- Rename - Event signalling file/folder name change.

- <a name="fsevent"></a>`FSEvent`
	- Type holding the information about a file-system event.
	- Fields:
		- eventKind: [FSEventKind](#fseventkind) - Type of the event.
		- isDir: boolean - True if the event is related to a directory. False if the event is related to a file.
		- path: string - Path where the event occurred.
		- pathOld: string - Old path in case of a rename event, same as path otherwise.
		- timestamp: Date - Approximate timestamp of when the event occurred.

- <a name="fsresult"></a>`FSResult`
	- Type for the result of a file-system operation.
	- Fields:
		- successful: boolean - True if the operation was successful, false otherwise.
		- path: string - Path to the file.
		- message: string - If the operation was successful, empty string in a write operation or content of the file in a read operation. Error message otherwise.

- `async writeFile(content: string, path:string, useRelativePath: boolean, appendMode: boolean): Promise<FSResult>`
	- Writes text into a file. Missing subdirectories are recursively created.
	- Parameters:
		- content: string - The text to be written into the file.
		- path: string - Path to the file.
		- useRelativePath: boolean - If false, the path is considered an absolute path. If true, the path is considered a relative path, starting from the root of the module's directory.
		- appendMode: boolean - If false, the file is truncated before writing the content. If true, the current content of the file is kept and the text is appended to the end of it.
	- Returns:
		- [FSResult](#fsresult) of the operation.

- `async readFile(path: string, useRelativePath: boolean)`
	- Reads text from a file.
	- Parameters:
		- path: string - Path to the file.
		- useRelativePath: boolean - If false, the path is considered an absolute path. If true, the path is considered a relative path, starting from the root of the module's directory.
	- Returns:
		- [FSResult](#fsresult) of the operation.

Alongside these functions, the File-System API exposes an instance of a WatchManager. This provides methods to access the file-system monitoring functionality. WatchManager exposes the following methods:

- `watchPath(id, path, callback)`
	- Starts watching a path, and triggers the callback when events occur at the path or its children.
	- Parameters:
		- id: string - ID of the watcher
		- path: string - Absolute path to be watched.
		- callback: (event: [FSEvent](#fsevent)) => void - The callback to be triggered when an event occurs.

- `stopWatching(id)`
	- Stops watching a path
	- Parameters:
		- id: string - ID of the watcher to be stopped.

- `stopAll()`
	- Stops all watchers of this window.

### Shortcut API

The shortcut API exposes following enums and types related to keys and key combinations:

- <a name="modifierkey"></a>`ModifierKey`
	- Enum for modifier keys.
	- Values:
		- LeftMeta
		- RightMeta
		- LeftControl
		- RightControl
		- Alt
		- AltGr
		- LeftShift
		- RightShift

- <a name="key"></a>`Key`
	- Enum for non-modifier keys.
	- Values:
		- BackQuote
		- Num1
		- Num2
		- Num3
		- Num4
		- Num5
		- Num6
		- Num7
		- Num8
		- Num9
		- Num0
		- Minus
		- Equal
		- F1
		- F2
		- F3
		- F4
		- F5
		- F6
		- F7
		- F8
		- F9
		- F10
		- F11
		- F12
		- Q
		- W
		- E
		- R
		- T
		- Y
		- U
		- I
		- O
		- P
		- A
		- S
		- D
		- F
		- G
		- H
		- J
		- K
		- L
		- Z
		- X
		- C
		- V
		- B
		- N
		- M
		- KeyPadReturn
		- KeyPadMinus,
		- KeyPadPlus
		- KeyPadMultiply
		- KeyPadDivide
		- KeyPadDelete
		- KeyPad0
		- KeyPad1
		- KeyPad2
		- KeyPad3
		- KeyPad4
		- KeyPad5
		- KeyPad6
		- KeyPad7
		- KeyPad8
		- KeyPad9
		- UpArrow
		- DownArrow
		- LeftArrow
		- RightArrow
		- Insert
		- Home
		- Delete
		- End
		- PageUp
		- PageDown
		- Escape
		- Enter
		- Space
		- Tab
		- PrintScreen
		- Pause
		- Function
		- ScrollLock
		- NumLock
		- CapsLock
		- Backspace
		- LeftBracket
		- RightBracket
		- Semicolon
		- Quote
		- Backslash
		- Comma
		- Period
		- Slash

- <a name="keycombination"></a>`KeyCombination`
	- Type representing key combinations
	- Fields:
		- key: [Key](#key) - The key that activates the key combination.
		- [optional] modifiers: [ModifierKey](#modifierkey)[] - Array of modifiers that need to be pressed for the key combination to activate.

Alongside these enums and types, the Shortcut API also exposes an instance of a ShortcutManager. This provides methods to access the shortcut functionality. ShortcutManager exposes the following methods:

- `addShortcut(id, name, description, callback, defaultKeybinds): boolean`
	- Adds a new shortcut for this window.
	- Parameters:
		- id: string - ID of the shortcut
		- name: string - Name of the shortcut
		- description: string - Description of the shortcut.
		- callback: () => void - Callback that will be triggered when a key combination bound to this shortcut is pressed.
		- [optional] defaultKeybinds: [KeyCombination](#keycombination)[] - An array of key combinations to be initially bound to this shortcut.
	- Returns:
		- True if the shortcut was successfully added. False otherwise.

- `removeShortcut(id)`
	- Removes a shortcut of this window.
	- Parameters:
		- id: string - ID of the shortcut to be removed.

- `removeAllShortcuts()`
	- Removes all of the shortcuts of this window.

### Input Simulation API

The Input Simulation API exposes the following enums, types and functions for file-system operations:

- <a name="mousebutton"></a>`MouseButton`
	- Enum for the supported mouse buttons.
	- Values:
		- MouseLeft - Left Mouse Button
		- MouseMiddle - Middle Mouse Button
		- MouseRight - Right Mouse Button

- <a name="direction"></a>`Direction`
	- Enum for mouse scroll directions.
	- Values:
		- Up
		- Down
		- Left
		- Right

- <a name="simulationstep"></a>`SimulationStep`
	- Type used to internally represent simulation steps in a format suitable for the backend. Values of this type are returned from the functions of this API and it is not recommended to construct them manually.
	- Fields:
		- device_type: number - The type of device to be simulated. 1 for the keyboard, 2 for the mouse.
		- simulation_type: number - The type of event to be simulated. 0 for KeyDown or MouseDown. 1 for KeyUp or MouseUp. 2 for KeyPress or MouseClick. 3 for MouseScroll. 4 for MouseMove.
		- data_str: string - Field for data that need to be represented by a string.
		- data_num1: number - First field for data that needs to be represented by a number.
		- data_num2: number - Second field for data that needs to be represented by a number.

- `simKeyDown(key)`
	- Creates a simulation step for pushing the selected key down.
	- Parameters:
		- key: [Key](#key)|[ModifierKey](#modifierkey) - Key to be pushed down. 
	- Returns:
		- The [SimulationStep](#simulationstep) representing the created simulation step.

- `simKeyUp(key)`
	- Creates a simulation step for releasing the selected key.
	- Parameters:
		- key: [Key](#key)|[ModifierKey](#modifierkey) - Key to be released.
	- Returns:
		- The [SimulationStep](#simulationstep) representing the created simulation step.

- `simKeyPress(key)`
	- Creates a simulation step for a quick press of the selected key.
	- Parameters:
		- key: [Key](#key)|[ModifierKey](#modifierkey) - Key to be pressed.
	- Returns:
		- The [SimulationStep](#simulationstep) representing the created simulation step.

- `simMouseDown(button)`
	- Creates a simulation step for pushing the selected mouse button down.
	- Parameters:
		- button: [MouseButton](#mousebutton) - Mouse Button to be pushed down.
	- Returns:
		- The [SimulationStep](#simulationstep) representing the created simulation step.

- `simMouseUp(button)`
	- Creates a simulation step for releasing the selected mouse button down.
	- Parameters:
		- button: [MouseButton](#mousebutton) - Mouse Button to be released.
	- Returns:
		- The [SimulationStep](#simulationstep) representing the created simulation step.

- `simMouseClick(button)`
	- Creates a simulation step for a quick click of the selected mouse button down.
	- Parameters:
		- button: [MouseButton](#mousebutton) - Mouse Button to be clicked.
	- Returns:
		- The [SimulationStep](#simulationstep) representing the created simulation step.

- `simMouseScroll(direction)`
	- Creates a simulation step for mouse scrolling in a specified direction.
	- Parameters:
		- direction: [Direction](#direction) - Direction for the scroll.
	- Returns:
		- The [SimulationStep](#simulationstep) representing the created simulation step.

- `simMouseMove(x, y)`
	- Creates a simulation step for moving the cursor to specified coordinates.
	- Parameters:
		- x: number - The X coordinate the cursor should be moved to.
		- y: number - The Y coordinate the cursor should be moved to.
	- Returns:
		- The [SimulationStep](#simulationstep) representing the created simulation step.

- `inputSimulation(steps)`
	- Executes a sequence of simulation steps in order. The sequence should be constructed using the provided functions with the `sim` prefix.
	- Parameters:
		- steps: [SimulationStep](#simulationstep)[] - An array of the simulation steps to be executed.
	- Examples:
		- `inputSimulation([simKeyDown("LShift"), simKeyPress("A"), simKeyUp("LShift)]);`
		- `inputSimulation([simMouseMove(37, 42), simMouseDown(MouseButton.MouseLeft), simMouseMove(342, 537), simMouseUp(MouseButton.MouseLeft)]);`

## Creating Windows

To assist with window creation, a React component named ModuleWindow is exported. By default, this component includes a title bar with buttons to minimize and close the window. You can disable this title bar by passing `showTitleBar=false` into its props.

If you want to make your own title bar, make sure to set `data-tauri-drag-region=true` on the element that you want to be used for window dragging. For minimizing and closing the window, use the API functions `hideWindow()` and `closeWindow()`. Be mindful that closing the main window closes the entire module.

## License

This project is licensed under the [GNU GPL3 License](LICENSE).
