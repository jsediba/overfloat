import { ModuleManager } from "../../utils/ModuleManager";

const ModuleSettings: React.FC = () => {
    return (
        <div className="container-fluid">
            <h2>Module Settings</h2>
            <select
                id="profileSelect"
                onChange={(event) =>
                    ModuleManager.getInstance().loadProfile(event.target.value)
                }>
                {ModuleManager.getInstance()
                    .getProfiles()
                    .map((profileName, index) => (
                        <option value={profileName} key={index}>
                            {profileName}
                        </option>
                    ))}
            </select>
        </div>
    );
};

export default ModuleSettings;
