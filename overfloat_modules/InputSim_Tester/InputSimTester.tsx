import { useState } from "react";
import { ModuleWindow } from "../../src/Api/ModuleWindow";

import {
    Direction,
    MouseButton,
    SimulationStep,
    simKeyPress,
    simKeyDown,
    simKeyUp,
    simMouseClick,
    simMouseDown,
    simMouseUp,
    simMouseScroll,
    simMouseMove,
    inputSimulation,
} from "../../src/Api/InputSimulation";

const InputSimTester: React.FC = () => {
    const [simStr, setSimStr] = useState<string[]>([]);
    const [sim, setSim] = useState<SimulationStep[]>([]);

    const [keyPress, setKeyPress] = useState<string>("");
    const [keyDown, setKeyDown] = useState<string>("");
    const [keyUp, setKeyUp] = useState<string>("");

    const [mouseClick, setMouseClick] = useState<string>("Left");
    const [mouseDown, setMouseDown] = useState<string>("Left");
    const [mouseUp, setMouseUp] = useState<string>("Left");

    const [scroll, setScroll] = useState<string>("Up");

    const [x, setX] = useState<number>(0);
    const [y, setY] = useState<number>(0);

    const addSimulationStep = (step: SimulationStep) => {
        setSim((prev) => [...prev, step]);
    };

    const addStepStr = (step: string) => {
        setSimStr((prev) => [...prev, step]);
    };

    /*
    const mouseButtonToStr = (button: MouseButton) => {
        switch (button) {
            case MouseButton.MouseLeft:
                return "Left";
                break;
            case MouseButton.MouseMiddle:
                return "Middle";
                break;
            case MouseButton.MouseRight:
                return "Right";
                break;
        }
    };
    */
    const strToMouseButton = (button: string) => {
        switch (button) {
            case "Left":
                return MouseButton.MouseLeft;
                break;
            case "Middle":
                return MouseButton.MouseMiddle;
                break;
            case "Right":
                return MouseButton.MouseRight;
                break;
            default:
                return MouseButton.MouseLeft;
                break;
        }
    };

    /*
    const directionToStr = (direction: Direction) => {
        switch (direction) {
            case Direction.Up:
                return "Up";
                break;
            case Direction.Down:
                return "Down";
                break;
            case Direction.Left:
                return "Left";
                break;
            case Direction.Right:
                return "Right";
                break;
        }
    };
    */
    const strToDirection = (direction: string) => {
        switch (direction) {
            case "Up":
                return Direction.Up;
                break;
            case "Down":
                return Direction.Down;
                break;
            case "Left":
                return Direction.Left;
                break;
            case "Right":
                return Direction.Right;
                break;
            default:
                return Direction.Up;
                break;
        }
    };

    const getSimulationString = () => {
        let finalStr = "";
        simStr.forEach((string) => (finalStr = finalStr + string + ";"));
        return finalStr;
    };

    return (
        <ModuleWindow>
            <div className="container">
                <div className="row">
                    <div className="col-6">Key Press</div>
                    <input
                        type="text"
                        className="col-4"
                        onChange={(event) => setKeyPress(event.target.value)}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            addSimulationStep(simKeyPress(keyPress));
                            addStepStr("KeyPress(" + keyPress + ")");
                        }}>
                        Add
                    </button>
                </div>
                <div className="row">
                    <div className="col-6">Key Down</div>
                    <input
                        type="text"
                        className="col-4"
                        onChange={(event) => setKeyDown(event.target.value)}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            addSimulationStep(simKeyDown(keyDown));
                            addStepStr("KeyDown(" + keyDown + ")");
                        }}>
                        Add
                    </button>
                </div>
                <div className="row">
                    <div className="col-6">Key Up</div>
                    <input
                        type="text"
                        className="col-4"
                        onChange={(event) => setKeyUp(event.target.value)}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            addSimulationStep(simKeyUp(keyUp));
                            addStepStr("KeyUp(" + keyUp + ")");
                        }}>
                        Add
                    </button>
                </div>

                <div className="row">
                    <div className="col-6">Mouse Click</div>
                    <select
                        className="col-4"
                        onChange={(event) => setMouseClick(event.target.value)}>
                        <option value="Left">Left</option>
                        <option value="Middle">Middle</option>
                        <option value="Right">Right</option>
                    </select>
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            addSimulationStep(
                                simMouseClick(strToMouseButton(mouseClick))
                            );
                            addStepStr("MouseClick(" + mouseClick + ")");
                        }}>
                        Add
                    </button>
                </div>

                <div className="row">
                    <div className="col-6">Mouse Down</div>
                    <select
                        className="col-4"
                        onChange={(event) => setMouseDown(event.target.value)}>
                        <option value="Left">Left</option>
                        <option value="Middle">Middle</option>
                        <option value="Right">Right</option>
                    </select>
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            addSimulationStep(
                                simMouseDown(strToMouseButton(mouseDown))
                            );
                            addStepStr("MouseDown(" + mouseDown + ")");
                        }}>
                        Add
                    </button>
                </div>

                <div className="row">
                    <div className="col-6">Mouse Up</div>
                    <select
                        className="col-4"
                        onChange={(event) => setMouseUp(event.target.value)}>
                        <option value="Left">Left</option>
                        <option value="Middle">Middle</option>
                        <option value="Right">Right</option>
                    </select>
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            addSimulationStep(
                                simMouseUp(strToMouseButton(mouseUp))
                            );
                            addStepStr("MouseUp(" + mouseUp + ")");
                        }}>
                        Add
                    </button>
                </div>

                <div className="row">
                    <div className="col-6">Scroll</div>
                    <select
                        className="col-4"
                        onChange={(event) => setScroll(event.target.value)}>
                        <option value="Up">Up</option>
                        <option value="Down">Down</option>
                        <option value="Left">Left</option>
                        <option value="Right">Right</option>
                    </select>
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            addSimulationStep(
                                simMouseScroll(strToDirection(scroll))
                            );
                            addStepStr("MouseScroll(" + scroll + ")");
                        }}>
                        Add
                    </button>
                </div>

                <div className="row">
                    <div className="col-6">Move Mouse</div>
                    <input
                        className="col-2"
                        type="number"
                        defaultValue={x}
                        onChange={(event) => setX(event.target.valueAsNumber)}
                    />
                    <input
                        className="col-2"
                        type="number"
                        defaultValue={y}
                        onChange={(event) => setY(event.target.valueAsNumber)}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            addSimulationStep(simMouseMove(x, y));
                            addStepStr("MouseMove(" + x + ", " + y + ")");
                        }}>
                        Add
                    </button>
                </div>
            </div>
            <hr />
            <div className="container">
                {<div className="row">{getSimulationString()}</div>}
                <div className="row">
                    <button
                        className="btn btn-primary col-6"
                        onClick={() => inputSimulation(sim)}>
                        Execute
                    </button>
                    <button
                        className="btn btn-secondary col-6"
                        onClick={() => {
                            setSim([]);
                            setSimStr([]);
                        }}>
                        Clear
                    </button>
                </div>
            </div>
        </ModuleWindow>
    );
};

export default InputSimTester;
