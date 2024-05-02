/*****************************************************************************
 * @FilePath    : src/components/Shortcuts/ShortcutDispay.tsx                *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect, useState } from "react";
import { Shortcut } from "../../utils/Shortcut";
import KeybindDisplay from "./KeybindDisplay";
import { KeybindManager } from "../../utils/KeybindManager";
import { Modal } from "react-bootstrap";
import useStateRef from "react-usestateref";
import { KeybindEventHandler } from "../../utils/KeybindEventHandler";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { OverfloatEvent } from "../../utils/WindowEventHandler";
import { KeypressEventPayload } from "../../utils/KeybindEventHandler";
import { IconPlus } from "@tabler/icons-react";

interface ShortcutDisplayProps {
    moduleName: string;
    shortcut: Shortcut;
}

/**
 * React component for displaying a single shortcut.
 */
const ShortcutDisplay: React.FC<ShortcutDisplayProps> = (
    props: ShortcutDisplayProps
) => {
    const moduleName: string = props["moduleName"];
    const shortcut: Shortcut = props["shortcut"];

    const [boundKeys, setBoundKeys] = useState<string[]>([
        ...shortcut.getBoundKeys(),
    ]);

    useEffect(() => {
        // Function to update the bound keys
        const updateBoundKeys = () => {
            setBoundKeys([...shortcut.getBoundKeys()]);
            console.log("Updating bound keys");
        };

        // Initial update
        updateBoundKeys();

        // Subscribe to the keybind manager notifications
        KeybindManager.getInstance().subscribe(updateBoundKeys);

        // Unsubscribe from the keybind manager notifications on unmount
        return () => {
            KeybindManager.getInstance().unsubscribe(updateBoundKeys);
        };
    }, []);

    // Reference to the unlisten promise for the KeyPress event, used when adding a new keybind
    let unlisten: Promise<UnlistenFn> | undefined = undefined;

    // State for the new keybind modal
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [newKeybind, setNewKeybind, refNewKeybind] = useStateRef<string>("");

    const [errorMessage, setErrorMessage, refErrorMessage] =
        useStateRef<string>("");

    // Handler for the KeyPress event
    const handleKeypress = (key: string) => {
        setNewKeybind(key);

        // Check if the selected key combination is valid for this shortcut and update the error message
        if (shortcut.getBoundKeys().includes(key)) {
            setErrorMessage(
                "This action already has selected key combination bound!"
            );
        } else if (refNewKeybind.current == "") {
            setErrorMessage("No key combination selected!");
        } else {
            setErrorMessage("");
        }
    };

    // Handler for adding a new keybind
    const addKeybind = async () => {
        // If invalid key combination is selected, return
        if (refErrorMessage.current != "") {
            return;
        }

        // Add the new keybind
        KeybindManager.getInstance().addKeybind(
            moduleName,
            shortcut.getWindowLabel(),
            shortcut.getId(),
            refNewKeybind.current
        );
        await handleCloseModal();
    };

    // Handler for opening the new keybind modal
    const handleShowModal = async () => {
        setNewKeybind("");
        setErrorMessage("No key combination selected!");

        // Temporarily stop propagation of KeyPress events to modules
        await KeybindEventHandler.getInstance().stopListening();

        // Listen for KeyPress events
        unlisten = listen(
            "Overfloat://GlobalKeypress",
            (event: OverfloatEvent<KeypressEventPayload>) =>
                handleKeypress(event.payload.key)
        );

        setModalVisible(true);
    };

    // Handler for closing the new keybind modal
    const handleCloseModal = async () => {
        // Restart propagation of KeyPress events to modules
        KeybindEventHandler.getInstance().startListening();

        // Stop listening for KeyPress events
        await unlisten?.then((f) => f());
        setModalVisible(false);
    };

    return (
        <>
            {/* Modal for adding a new keybind */}
            <Modal show={modalVisible} onHide={handleCloseModal}>
                <Modal.Body className="keybindModal">
                    <div className="container">
                        <div className="row">
                            <div className="col h4 text-center">
                                Add Keybind
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            {/* Display the selected key combination with spaces between keys */}
                            <div className="col h4 text-center fw-bold text-wrap">
                                {newKeybind.replace(/\+/g, " + ")}
                            </div>
                        </div>
                        <hr />

                        {/* Error message */}
                        <div
                            className={
                                "row" +
                                (refErrorMessage.current != "" ? "" : " d-none")
                            }>
                            <div className="col text-center">
                                <p className="text-danger small">
                                    {errorMessage}
                                </p>
                                <hr />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col text-center">
                                {/* Button to add the new keybind*/}
                                <button
                                    className="modalButtonOk"
                                    onClick={addKeybind}
                                    disabled={refErrorMessage.current != ""}>
                                    Add
                                </button>
                            </div>

                            <div className="col text-center">
                                {/* Button to cancel adding the new keybind*/}
                                <button
                                    className="modalButtonCancel"
                                    onClick={handleCloseModal}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Display the shortcut information */}
            <div className="container">
                <div className="row">
                    <div className="col-2">{shortcut.getName()}</div>
                    <div className="col">{shortcut.getDescription()}</div>
                    <div className="col-4">
                        {/* Display the keybinds of the shortcut */}
                        <div className="container-fluid">
                            {boundKeys.map((_, index) => (
                                <KeybindDisplay
                                    moduleName={moduleName}
                                    shortcut={shortcut}
                                    position={index}
                                    key={index}
                                />
                            ))}
                            <div className="row">
                                {/* Button to add a new keybind */}
                                <div className="col text-center">
                                    <button
                                        className="addKeybindButton"
                                        onClick={handleShowModal}
                                        title="Add Keybind">
                                        <IconPlus />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr />
            </div>
        </>
    );
};

export default ShortcutDisplay;
