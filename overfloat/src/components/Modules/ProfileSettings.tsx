/*****************************************************************************
 * @FilePath    : src/components/Modules/ProfileSettings.tsx                 *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { useEffect, useState } from "react";
import { ModuleManager } from "../../utils/ModuleManager";
import {
    IconDeviceFloppy,
    IconPlus,
    IconTrash,
    IconUpload,
} from "@tabler/icons-react";
import LoadingModal from "./LoadingModal";
import { Modal } from "react-bootstrap";
import "../Shortcuts/css/Shortcuts.css";
import useStateRef from "react-usestateref";

/**
 * React component for the Profile settings.
 */
const ProfileSettings: React.FC = () => {
    const [allProfiles, setAllProfiles] = useState<string[]>([
        ...ModuleManager.getInstance().getProfiles(),
    ]);
    const [selectedProfile, setSelectedProfile] = useState<string>(
        ModuleManager.getInstance().getActiveProfile()
    );
    useEffect(() => {
        // Function to update the profiles
        const updateProfiles = () => {
            setAllProfiles([...ModuleManager.getInstance().getProfiles()]);
            setSelectedProfile(ModuleManager.getInstance().getActiveProfile());
        };

        // Subscribe to the module manager notifications
        ModuleManager.getInstance().subscribe(updateProfiles);

        // Unsubscribe from the module manager notifications on unmount
        return () => {
            ModuleManager.getInstance().unsubscribe(updateProfiles);
        };
    }, []);

    // State for the loading modal
    const [loading, setLoading] = useState<boolean>(false);

    // State for the new profile modal
    const [newProfileModalVisible, setNewProfileModalVisible] =
        useState<boolean>(false);
    const [newProfileName, setNewProfileName] = useState<string>("");
    const [errorMessage, setErrorMessage, refErrorMessage] =
        useStateRef<string>("");

    // Handler for the new profile name change
    const handleNewProfileNameChange = (name: string) => {
        if (name == "") {
            setErrorMessage("Profile name cannot be empty!");
        } else if (ModuleManager.getInstance().getProfiles().includes(name)) {
            setErrorMessage("Profile with this name already exists!");
        } else {
            setErrorMessage("");
        }

        setNewProfileName(name);
    };

    // Handlers for the new profile modal
    const handleShowNewProfileModal = async () => {
        setNewProfileName("");
        setErrorMessage("Profile name cannot be empty!");
        setNewProfileModalVisible(true);
    };
    const handleCloseNewProfileModal = async () => {
        setNewProfileName("Profile name cannot be empty!");
        setNewProfileModalVisible(false);
    };
    const handleAddProfile = async () => {
        await ModuleManager.getInstance().addProfile(newProfileName);
        handleCloseNewProfileModal();
    };

    return (
        <div className="container">
            {/* Loading Modal */}
            <LoadingModal visible={loading} />

            {/* New Profile Modal */}
            <Modal
                show={newProfileModalVisible}
                onHide={handleCloseNewProfileModal}>
                <Modal.Body className="keybindModal">
                    <div className="container">
                        <div className="row">
                            <div className="col h4 text-center">
                                Add Profile
                            </div>
                        </div>
                        <hr />
                        <div className="row">
                            <input
                                type="text"
                                className="col"
                                value={newProfileName}
                                placeholder="Enter the name of a new profile"
                                onChange={(event) =>
                                    handleNewProfileNameChange(
                                        event.target.value
                                    )
                                }
                            />
                        </div>
                        <hr />
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
                                <button
                                    className="modalButtonOk"
                                    onClick={handleAddProfile}
                                    disabled={refErrorMessage.current != ""}
                                    title="Add Profile">
                                    Save
                                </button>
                            </div>
                            <div
                                className="col text-center"
                                onClick={handleCloseNewProfileModal}>
                                <button
                                    className="modalButtonCancel"
                                    title="Cancel">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Profile Selection */}
            <div className="row">
                <select
                    className="col-9"
                    id="profileSelect"
                    onChange={(event) => setSelectedProfile(event.target.value)}
                    value={selectedProfile}>
                    {allProfiles.map((profileName, index) => (
                        <option value={profileName} key={index}>
                            {profileName}
                        </option>
                    ))}
                </select>
                <div className="btn-group col-3">
                    {/* Load Profile Button */}
                    <button
                        className="profileControlButton"
                        onClick={async () => {
                            setLoading(true);
                            await ModuleManager.getInstance().loadProfile(
                                selectedProfile
                            );
                            setLoading(false);
                        }}
                        title="Load Profile">
                        <IconUpload />
                    </button>

                    {/* Update Profile Button */}
                    <button
                        className="profileControlButton"
                        onClick={async () => {
                            await ModuleManager.getInstance().saveProfile(
                                selectedProfile
                            );
                        }}
                        title="Update Profile">
                        <IconDeviceFloppy />
                    </button>

                    {/* Delete Profile Button */}
                    <button
                        className="profileControlButton"
                        onClick={async () => {
                            await ModuleManager.getInstance().deleteProfile(
                                selectedProfile
                            );
                        }}
                        title="Delete Profile">
                        <IconTrash />
                    </button>

                    {/* New Profile Button */}
                    <button
                        className="profileControlButton"
                        onClick={handleShowNewProfileModal}
                        title="Add Profile">
                        <IconPlus />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;
