/*****************************************************************************
 * @FilePath    : overfloat_modules/InputSim_Tester/InputSimTester.tsx       *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect, useState } from "react";
import useStateRef from "react-usestateref";
import Select, { SingleValue } from "react-select";

import {
    ModuleWindow,
    Key,
    ModifierKey,
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
    ShortcutManager,
} from "@OverfloatAPI";

type KeyValue = {
    value: string;
    label: string;
};

type MouseButtonValue = {
    value: MouseButton;
    label: string;
};

type DirectionValue = {
    value: Direction;
    label: string;
};

const InputSimTester: React.FC = () => {
    useEffect(() => {
        ShortcutManager.addShortcut(
            "input_sim",
            "Input Simulation",
            "Executes the input simulation steps.",
            () => {
                inputSimulation(refSim.current);
            },
            []
        );
    }, []);


    const [simStr, setSimStr] = useState<string[]>([]);
    const [sim, setSim, refSim] = useStateRef<SimulationStep[]>([]);

    const [keyPress, setKeyPress] = useState<SingleValue<KeyValue> | null>(
        null
    );
    const [keyDown, setKeyDown] = useState<SingleValue<KeyValue> | null>(
        null
    );
    const [keyUp, setKeyUp] = useState<SingleValue<KeyValue> | null>(null);

    const keyOptions = Object.keys(Key).map((key: string) => ({
        value: Key[key as keyof typeof Key] as string,
        label: key,
    }));
    const modifierKeyOptions = Object.keys(ModifierKey).map((key: string) => ({
        value: ModifierKey[key as keyof typeof ModifierKey] as string,
        label: key,
    }));
    const allKeyOptions = keyOptions.concat(modifierKeyOptions);


    const [mouseClick, setMouseClick] =
        useState<SingleValue<MouseButtonValue> | null>(null);
    const [mouseDown, setMouseDown] = useState<SingleValue<MouseButtonValue> | null>(
        null
    );
    const [mouseUp, setMouseUp] = useState<SingleValue<MouseButtonValue> | null>(
        null
    );

    const mouseButtonOptions = Object.values(MouseButton).map((value: MouseButton) => ({
        value: value,
        label: value as string,
    }));

    const [scroll, setScroll] = useState<SingleValue<DirectionValue> | null>(null);
    const directionOptions = Object.values(Direction).map((value: Direction) => ({
        value: value,
        label: value as string,
    }));

    const [x, setX] = useState<number>(0);
    const [y, setY] = useState<number>(0);

    const addSimulationStep = (step: SimulationStep) => {
        console.log(step);
        setSim((prev) => [...prev, step]);
    };

    const addStepStr = (step: string) => {
        setSimStr((prev) => [...prev, step]);
    };

    const getSimulationString = () => {
        let finalStr = "";
        simStr.forEach((string) => (finalStr += string + "; "));
        return finalStr;
    };

    return (
        <ModuleWindow>
            <div className="container">
                <div className="row my-1">
                    <div className="col-6">Key Press</div>
                    <Select
                        className="col-4"
                        value={keyPress}
                        onChange={setKeyPress}
                        options={allKeyOptions}
                        isSearchable={true}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            if (keyPress == null) return;
                            console.log(keyPress);
                            addSimulationStep(simKeyPress(keyPress.value as Key|ModifierKey));
                            addStepStr("KeyPress(" + (keyPress.value + ")"));
                        }}>
                        Add
                    </button>
                </div>
                <div className="row my-1">
                    <div className="col-6">Key Down</div>
                    <Select
                        className="col-4"
                        value={keyDown}
                        onChange={setKeyDown}
                        options={allKeyOptions}
                        isSearchable={true}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            if (keyDown == null) return;
                            addSimulationStep(simKeyDown(keyDown.value as Key|ModifierKey));
                            addStepStr("KeyDown(" + keyDown.value + ")");
                        }}>
                        Add
                    </button>
                </div>
                <div className="row my-1">
                    <div className="col-6">Key Up</div>
                    <Select
                        className="col-4"
                        value={keyUp}
                        onChange={setKeyUp}
                        options={allKeyOptions}
                        isSearchable={true}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            if (keyUp == null) return;
                            addSimulationStep(simKeyUp(keyUp.value as Key|ModifierKey));
                            addStepStr("KeyUp(" + keyUp.value + ")");
                        }}>
                        Add
                    </button>
                </div>

                <div className="row my-1">
                    <div className="col-6">Mouse Click</div>
                    <Select
                        className="col-4"
                        value={mouseClick}
                        onChange={setMouseClick}
                        options={mouseButtonOptions}
                        isSearchable={true}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            if (mouseClick == null) return;
                            addSimulationStep(simMouseClick(mouseClick.value));
                            addStepStr("MouseClick(" + mouseClick.value + ")");
                        }}>
                        Add
                    </button>
                </div>

                <div className="row my-1">
                    <div className="col-6">Mouse Down</div>
                    <Select
                        className="col-4"
                        value={mouseDown}
                        onChange={setMouseDown}
                        options={mouseButtonOptions}
                        isSearchable={true}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            if (mouseDown == null) return;
                            addSimulationStep(simMouseDown(mouseDown.value));
                            addStepStr("MouseDown(" + mouseDown.value + ")");
                        }}>
                        Add
                    </button>
                </div>

                <div className="row my-1">
                    <div className="col-6">Mouse Up</div>
                    <Select
                        className="col-4"
                        value={mouseUp}
                        onChange={setMouseUp}
                        options={mouseButtonOptions}
                        isSearchable={true}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            if (mouseUp == null) return;
                            addSimulationStep(simMouseUp(mouseUp.value));
                            addStepStr("MouseUp(" + mouseUp.value + ")");
                        }}>
                        Add
                    </button>
                </div>

                <div className="row my-1">
                    <div className="col-6">Scroll</div>
                    <Select
                        className="col-4"
                        value={scroll}
                        onChange={setScroll}
                        options={directionOptions}
                        isSearchable={true}
                    />
                    <button
                        className="btn btn-primary col-2"
                        onClick={() => {
                            if (scroll == null) return;
                            addSimulationStep(simMouseScroll(scroll.value));
                            addStepStr("MouseScroll(" + scroll.value + ")");
                        }}>
                        Add
                    </button>
                </div>

                <div className="row my-1">
                    <div className="col-6">Move Mouse</div>
                    <div className="col-2">
                        <input
                            className="form-control"
                            type="number"
                            defaultValue={x}
                            onChange={(event) =>
                                setX(event.target.valueAsNumber)
                            }
                        />
                    </div>
                    <div className="col-2">
                        <input
                            className="form-control"
                            type="number"
                            defaultValue={y}
                            onChange={(event) =>
                                setY(event.target.valueAsNumber)
                            }
                        />
                    </div>
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
                {<div className="row my-1">{getSimulationString()}</div>}
                <div className="row my-1">
                    <button
                        className="btn btn-primary col-6"
                        onClick={() => {console.log(sim);inputSimulation(sim)}}>
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
