import { invoke } from "@tauri-apps/api";

type SimulationStep = {
    device_type: number;
    simulation_type: number;
    data_str: string;
    data_num1: number;
    data_num2: number;
};

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

export function simWait(time: number): SimulationStep {
    return constructSimulationStep(0, 0, undefined, time);
}

export function simKeyDown(key: string): SimulationStep {
    return constructSimulationStep(1, 0, key);
}

export function simKeyUp(key: string): SimulationStep {
    return constructSimulationStep(1, 1, key);
}

export function simKeyPress(key: string): SimulationStep {
    return constructSimulationStep(1, 2, key);
}

enum MouseButton {
    MouseLeft,
    MouseMiddle,
    MouseRight,
}

enum Direction {
    Up,
    Down,
    Left,
    Right,
}

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

export function simMouseDown(button: MouseButton): SimulationStep {
    return constructSimulationStep(2,0, undefined, mouseButtonToNumber(button));
}

export function simMouseUp(button: MouseButton): SimulationStep {
    return constructSimulationStep(2,1, undefined, mouseButtonToNumber(button));
}

export function simMouseClick(button: MouseButton): SimulationStep {
    return constructSimulationStep(2,2, undefined, mouseButtonToNumber(button));

}

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

export function simMouseScroll(direction: Direction): SimulationStep {
    const mouseDelta: [number, number] = directionToDelta(direction);
    return constructSimulationStep(2,3, undefined, mouseDelta[0], mouseDelta[1]);
}

export function simMouseMove(x: number, y: number): SimulationStep {
    return constructSimulationStep(2,0, undefined, x, y);
}

export function inputSimulation(steps: SimulationStep[]) {
    //invoke("input_simulation", { simulationSteps: JSON.stringify(steps) });
    invoke("input_simulation", { simulationSteps: steps });

}
