import { useEffect, useState } from "react";
import { ModuleManager } from "../../utils/ModuleManager"

const ProfileSettings: React.FC = () => {
    const [allProfiles, setAllProfiles] = useState<string[]>([...ModuleManager.getInstance().getProfiles()]);
    const [selectedProfile, setSelectedProfile] = useState<string>(ModuleManager.getInstance().getActiveProfile());
    const [newProfileName, setNewProfileName] = useState<string>("");

    useEffect(() => {
        const updateProfiles = () => {
            setAllProfiles([...ModuleManager.getInstance().getProfiles()]);
            setSelectedProfile(ModuleManager.getInstance().getActiveProfile());
        }

        updateProfiles();
        ModuleManager.getInstance().subscribe(updateProfiles);

        return () => {
            ModuleManager.getInstance().unsubscribe(updateProfiles);
        }
    }, [])

    return (
        <div className="container">
            <div className="row">
                <select
                    className="col-9"
                    id="profileSelect"
                    onChange={(event) =>
                        setSelectedProfile(event.target.value)
                    }
                    value={selectedProfile}
                >
                    {allProfiles.map((profileName, index) => (
                        <option value={profileName} key={index}>
                            {profileName}
                        </option>
                    ))}
                </select>
                <button className="btn btn-primary col-1" onClick={() => {
                    ModuleManager.getInstance().loadProfile(selectedProfile);
                }}>
                    Load
                </button>
                <button className="btn btn-primary col-1" onClick={() => {
                    ModuleManager.getInstance().saveProfile(selectedProfile);
                }}>
                    Update
                </button>
                <button className="btn btn-primary col-1" onClick={() => {
                    ModuleManager.getInstance().deleteProfile(selectedProfile);
                }}>
                    Delete
                </button>
            </div>
            <div className="row">
                <input type="text" className="col-9" value={newProfileName} placeholder="Enter the name of a new profile" onChange={(event) => setNewProfileName(event.target.value)} />
                <button className="btn btn-primary col-1" onClick={() => ModuleManager.getInstance().addProfile(newProfileName)}>Add</button>
            </div>
        </div>
    )
}

export default ProfileSettings;