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
import { IconX } from "@tabler/icons-react";

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

/**
 * Main window of the module for testing the input simulation.
 */
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

    // State for the simulation steps
    const [sim, setSim, refSim] = useStateRef<SimulationStep[]>([]);
    const [simString, setSimString] = useState<string[]>([]);

    // State for the input parameters and select option preparation.
    const [key, setKey] = useState<SingleValue<KeyValue> | null>(null);
    const keyOptions = Object.keys(Key).map((key: string) => ({
        value: Key[key as keyof typeof Key] as string,
        label: key,
    }));
    const modifierKeyOptions = Object.keys(ModifierKey).map((key: string) => ({
        value: ModifierKey[key as keyof typeof ModifierKey] as string,
        label: key,
    }));
    const allKeyOptions = keyOptions.concat(modifierKeyOptions);

    const [mouseButton, setMouseButton] =
        useState<SingleValue<MouseButtonValue> | null>(null);
    const mouseButtonOptions = Object.values(MouseButton).map(
        (value: MouseButton) => ({
            value: value,
            label: value as string,
        })
    );

    const [scroll, setScroll] = useState<SingleValue<DirectionValue> | null>(
        null
    );
    const directionOptions = Object.values(Direction).map(
        (value: Direction) => ({
            value: value,
            label: value as string,
        })
    );

    const [x, setX] = useState<number>(0);
    const [y, setY] = useState<number>(0);

    // Functions for adding and removing simulation steps.
    const addSimulationStep = (step: SimulationStep) => {
        setSim((prev) => [...prev, step]);
    };

    const addSimulationStepString = (step: string) => {
        setSimString((prev) => [...prev, step]);
    };

    const removeStep = (index: number) => {
        if (index < 0 || index >= sim.length) return;
        setSim((prev) => [...prev.slice(0, index), ...prev.slice(index + 1)]);
        setSimString((prev) => [
            ...prev.slice(0, index),
            ...prev.slice(index + 1),
        ]);
    };

    return (
        <ModuleWindow>
            <div style={{minWidth: "780px"}}>
                {/* Controls for adding simulation steps */}
                <div className="container-fluid">
                    <div className="row my-1">
                        <div className="col-3">Key</div>
                        <Select
                            className="col-3"
                            value={key}
                            onChange={setKey}
                            options={allKeyOptions}
                            isSearchable={true}
                        />
                        <div className="btn-group col">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (key == null) return;
                                    addSimulationStep(
                                        simKeyPress(
                                            key.value as Key | ModifierKey
                                        )
                                    );
                                    addSimulationStepString(
                                        "KeyPress(" + key.value + ")"
                                    );
                                }}>
                                KeyPress
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (key == null) return;
                                    addSimulationStep(
                                        simKeyDown(
                                            key.value as Key | ModifierKey
                                        )
                                    );
                                    addSimulationStepString(
                                        "KeyDown(" + key.value + ")"
                                    );
                                }}>
                                KeyDown
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (key == null) return;
                                    addSimulationStep(
                                        simKeyUp(key.value as Key | ModifierKey)
                                    );
                                    addSimulationStepString(
                                        "KeyUp(" + key.value + ")"
                                    );
                                }}>
                                KeyUp
                            </button>
                        </div>
                    </div>
                    <div className="row my-1">
                        <div className="col-3">Mouse Button</div>
                        <Select
                            className="col-3"
                            value={mouseButton}
                            onChange={setMouseButton}
                            options={mouseButtonOptions}
                            isSearchable={true}
                        />
                        <div className="btn-group col">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    if (mouseButton == null) return;
                                    addSimulationStep(
                                        simMouseClick(mouseButton.value)
                                    );
                                    addSimulationStepString(
                                        "MouseClick(" + mouseButton.value + ")"
                                    );
                                }}>
                                MouseClick
                            </button>
                            <button
                                className="btn btn-primary "
                                onClick={() => {
                                    if (mouseButton == null) return;
                                    addSimulationStep(
                                        simMouseDown(mouseButton.value)
                                    );
                                    addSimulationStepString(
                                        "MouseDown(" + mouseButton.value + ")"
                                    );
                                }}>
                                MouseDown
                            </button>
                            <button
                                className="btn btn-primary "
                                onClick={() => {
                                    if (mouseButton == null) return;
                                    addSimulationStep(
                                        simMouseUp(mouseButton.value)
                                    );
                                    addSimulationStepString(
                                        "MouseUp(" + mouseButton.value + ")"
                                    );
                                }}>
                                MouseUp
                            </button>
                        </div>
                    </div>

                    <div className="row my-1">
                        <div className="col-3">Scroll</div>
                        <Select
                            className="col-3"
                            value={scroll}
                            onChange={setScroll}
                            options={directionOptions}
                            isSearchable={true}
                        />
                        <div className="btn-group col">
                            <button
                                className="btn btn-primary col-2"
                                onClick={() => {
                                    if (scroll == null) return;
                                    addSimulationStep(
                                        simMouseScroll(scroll.value)
                                    );
                                    addSimulationStepString(
                                        "MouseScroll(" + scroll.value + ")"
                                    );
                                }}>
                                Add
                            </button>
                        </div>
                    </div>

                    <div className="row my-1">
                        <div className="col-3">Move Mouse</div>

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
                        <div className="btn-group col">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    addSimulationStep(simMouseMove(x, y));
                                    addSimulationStepString(
                                        "MouseMove(" + x + ", " + y + ")"
                                    );
                                }}>
                                Add
                            </button>
                        </div>
                    </div>
                </div>
                <hr />
                <div className="container-fluid">
                    {/* Buttons to execute or clear the simulation sequence */}
                    <div className="row my-1 justify-content-center">
                        <button
                            className="btn btn-primary col-3 mx-2"
                            onClick={() => {
                                inputSimulation(sim);
                            }}>
                            Execute
                        </button>
                        <button
                            className="btn btn-secondary col-3 mx-2"
                            onClick={() => {
                                setSim([]);
                                setSimString([]);
                            }}>
                            Clear
                        </button>

                        {/* List of simulation steps and buttons to remove them */}
                        <div className="container mt-2">
                            {simString.map((step, index) => (
                                <div
                                    className="row mb-1 align-items-center"
                                    key={index}>
                                    <div className="col-1">
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => removeStep(index)}>
                                            <IconX />
                                        </button>
                                    </div>
                                    <div className="col fw-bold">{step}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </ModuleWindow>
    );
};

export default InputSimTester;
