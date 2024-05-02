/*****************************************************************************
 * @FilePath    : src/components/Shortcuts/KeybindDisplay.tsx                *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useState } from "react";
import useStateRef from "react-usestateref";
import { Modal } from "react-bootstrap";
import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { OverfloatEvent } from "../../utils/WindowEventHandler";
import {
    KeybindEventHandler,
    KeypressEventPayload,
} from "../../utils/KeybindEventHandler";
import { Shortcut } from "../../utils/Shortcut";
import { KeybindManager } from "../../utils/KeybindManager";
import { IconTrash } from "@tabler/icons-react";
import "./css/Shortcuts.css";

type KeybindDisplayProps = {
    moduleName: string;
    shortcut: Shortcut;
    position: number;
};

/**
 * React component for displaying a single keybind.
 */
const KeybindDisplay: React.FC<KeybindDisplayProps> = (
    props: KeybindDisplayProps
) => {
    const moduleName = props["moduleName"];
    const shortcut = props["shortcut"];
    const position = props["position"];

    const windowLabel = shortcut.getWindowLabel();
    const id = shortcut.getId();
    const keybind = shortcut.getBoundKeys()[position];

    // Reference to the unlisten promise for the KeyPress event, used when changing a keybind
    let unlisten: Promise<UnlistenFn> | undefined = undefined;

    // State for the keybind change modal
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [newKeybind, setNewKeybind] = useState<string>(keybind);

    const [errorMessage, setErrorMessage, refErrorMessage] =
        useStateRef<string>("");

    // Handler for the KeyPress event
    const handleKeypress = (key: string) => {
        setNewKeybind(key);
        if (shortcut.getBoundKeys().includes(key)) {
            setErrorMessage(
                "This action already has selected key combination bound!"
            );
        } else {
            setErrorMessage("");
        }
    };

    // Handler for showing the keybind change modal
    const handleShow = async () => {
        // Reset the keybind and error message
        setNewKeybind(keybind);
        setErrorMessage(
            "This action already has selected key combination bound!"
        );

        // Temporarily stop propagating KeyPress events to modules
        await KeybindEventHandler.getInstance().stopListening();
        unlisten = listen(
            "Overfloat://GlobalKeypress",
            (event: OverfloatEvent<KeypressEventPayload>) =>
                handleKeypress(event.payload.key)
        );
        setModalVisible(true);
    };

    // Handler for closing the keybind change modal
    const handleClose = async () => {
        // Restart propagating KeyPress events to modules
        KeybindEventHandler.getInstance().startListening();
        // Stop listening for KeyPress events
        await unlisten?.then((f) => f());
        setModalVisible(false);
    };

    // Handler for saving the new keybind
    const saveKeybind = async () => {
        // If invalid key combination is selected, return
        if (refErrorMessage.current != "") {
            return;
        }

        // Change the keybind
        KeybindManager.getInstance().changeKeybind(
            moduleName,
            windowLabel,
            id,
            position,
            newKeybind
        );
        await handleClose();
    };

    return (
        <>
            {/* Keybind change modal */}
            <Modal show={modalVisible} onHide={handleClose}>
                <Modal.Body className="keybindModal">
                    <div className="container">
                        <div className="row">
                            <div className="col h4 text-center">
                                Change Keybind
                            </div>
                        </div>
                        <hr />
                        {/* Display the new keybind */}
                        <div className="row">
                            <div className="col h4 text-center fw-bold text-wrap">
                                {newKeybind.replace(/\+/g, " + ")}
                            </div>
                        </div>
                        <hr />

                        {/* Display the error message if the key combination is invalid */}
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

                        {/* Buttons */}
                        <div className="row">
                            {/* Button to save the new keybind */}
                            <div className="col text-center">
                                <button
                                    className="modalButtonOk"
                                    onClick={saveKeybind}
                                    disabled={refErrorMessage.current != ""}>
                                    Save
                                </button>
                            </div>
                            {/* Button to cancel the keybind change */}
                            <div
                                className="col text-center"
                                onClick={handleClose}>
                                <button className="modalButtonCancel">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            <div className="row">
                <div className="col">
                    {/* Display the keybind in a button that opens the change keybind modal
                     * The keybind is truncated if it's too long but displayed fully on mouse hover
                     */}
                    <button
                        className="keybindButton text-truncate"
                        onClick={handleShow}
                        title={keybind}>
                        {keybind}
                    </button>
                    {/* Button to delete the keybind */}
                    <button
                        className="deleteKeybindButton"
                        onClick={() =>
                            KeybindManager.getInstance().removeKeybind(
                                moduleName,
                                windowLabel,
                                id,
                                position
                            )
                        }
                        title="Remove Keybind">
                        <IconTrash />
                    </button>
                </div>
            </div>
        </>
    );
};

export default KeybindDisplay;
