/*****************************************************************************
 * @FilePath    : src/api/InputSimulation.ts                                 *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { invoke } from "@tauri-apps/api";
import { Key, ModifierKey } from "./ShortcutManager";

// Type for a single simulation step
export type SimulationStep = {
    device_type: number;
    simulation_type: number;
    data_str: string;
    data_num1: number;
    data_num2: number;
};

// Function for constructing a single simulation step
function constructSimulationStep(
    device_type: number,
    simulation_type: number,
    data_str: string = "",
    data_num1: number = 0,
    data_num2: number = 0
): SimulationStep {
    return {
        device_type: device_type,
        simulation_type: simulation_type,
        data_str: data_str,
        data_num1: data_num1,
        data_num2: data_num2,
    };
}

/**
 * @brief Function for simulating a KeyDown event
 * @param key Key to be pushed down
 * @returns SimulationStep object representing the KeyDown event
 */
export function simKeyDown(key: Key|ModifierKey): SimulationStep {
    return constructSimulationStep(1, 0, key);
}

/**
 * @brief Function for simulating a KeyUp event
 * @param key Key to be released
 * @returns SimulationStep object representing the KeyUp event
 */
export function simKeyUp(key: Key|ModifierKey): SimulationStep {
    return constructSimulationStep(1, 1, key);
}

/**
 * @brief Function for simulating a KeyPress event
 * @param key Key to be pressed
 * @returns SimulationStep object representing the KeyPress event
 */
export function simKeyPress(key: Key|ModifierKey): SimulationStep {
    return constructSimulationStep(1, 2, key);
}

// Enum for different mouse buttons
export enum MouseButton {
    MouseLeft = "MouseLeft",
    MouseMiddle = "MouseMiddle",
    MouseRight = "MouseRight",
}

// Enum for different scroll directions
export enum Direction {
    Up = "Up",
    Down = "Down",
    Left = "Left",
    Right = "Right",
}

/**
 * @brief Function for converting MouseButton enum to a number representation
 * @param button MouseButton enum
 * @returns Number representation of the MouseButton for the SimulationStep
 */
function mouseButtonToNumber(button: MouseButton): number {
    switch (button) {
        case MouseButton.MouseLeft:
            return 0;
            break;
        case MouseButton.MouseMiddle:
            return 1;
            break;
        case MouseButton.MouseRight:
            return 2;
            break;
    }
}

/**
 * @brief Function for simulating a MouseDown event
 * @param button MouseButton enum
 * @returns SimulationStep object representing the MouseDown event
 */
export function simMouseDown(button: MouseButton): SimulationStep {
    return constructSimulationStep(2,0, undefined, mouseButtonToNumber(button));
}

/**
 * @brief Function for simulating a MouseUp event
 * @param button MouseButton enum
 * @returns SimulationStep object representing the MouseUp event
 */
export function simMouseUp(button: MouseButton): SimulationStep {
    return constructSimulationStep(2,1, undefined, mouseButtonToNumber(button));
}

/**
 * @brief Function for simulating a MouseClick event
 * @param button MouseButton enum
 * @returns SimulationStep object representing the MouseClick event
 */
export function simMouseClick(button: MouseButton): SimulationStep {
    return constructSimulationStep(2,2, undefined, mouseButtonToNumber(button));

}

/**
 * @brief Function for converting scroll Direction enum to a delta array
 * @param direction Direction enum
 * @returns Array representing the x and y deltas for the scroll event
 */
function directionToDelta(direction: Direction): [number, number] {
    switch (direction) {
        case Direction.Up:
            return [0,1];
            break;
        case Direction.Down:
            return [0,-1];
            break;
        case Direction.Left:
            return [-1,0];
            break;
        case Direction.Right:
            return [1,0];
            break;
    }
}

/**
 * @brief Function for simulating a MouseScroll event
 * @param direction Direction enum
 * @returns SimulationStep object representing the MouseScroll event
 */
export function simMouseScroll(direction: Direction): SimulationStep {
    const mouseDelta: [number, number] = directionToDelta(direction);
    return constructSimulationStep(2,3, undefined, mouseDelta[0], mouseDelta[1]);
}

/**
 * @brief Function for simulating a MouseMove event
 * @param x X coordinate the mouse should move to
 * @param y Y coordinate the mouse should move to
 * @returns SimulationStep object representing the MouseMove event
 */
export function simMouseMove(x: number, y: number): SimulationStep {
    return constructSimulationStep(2,4, undefined, x, y);
}

/**
 * @brief Function for executing a sequence of input simulation steps
 * @param steps Array of SimulationStep objects, should be constructed using the provided functions
 * @example inputSimulation([simKeyDown("A"), simMouseMove(250, 20), simKeyUp("A")]);
 */
export function inputSimulation(steps: SimulationStep[]) {
    invoke("input_simulation", { simulationSteps: steps });

}
