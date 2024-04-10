import { ModuleManager } from "../../utils/ModuleManager"

const ProfileSettings: React.FC = () => {
    return(
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
    )
}

export default ProfileSettings;