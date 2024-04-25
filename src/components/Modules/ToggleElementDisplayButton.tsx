import useStateRef from "react-usestateref";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react";
import { ReactElement, useState } from "react";
import "./css/Modules.css"

type ToggleElementDisplayButtonProps = {
    id: string;
}

const ToggleElementDisplayButton: React.FC<ToggleElementDisplayButtonProps> = (props: ToggleElementDisplayButtonProps) => {
    const id = props["id"];
    
    const [_, setVisible, refVisible] = useStateRef<boolean>(true);
    const [icon, setIcon] = useState<ReactElement>(<IconCaretUpFilled/>);


    const toggleDisplay = () => {
        let element = document.getElementById(id);
        if (element == null) return;
        
        if(refVisible.current) {
            element.style.display="none";
            setIcon(<IconCaretDownFilled />)
            setVisible(false);
        }
        else {
            element.style.display="block";
            setIcon(<IconCaretUpFilled />)
            setVisible(true); 
        }
    }

    return (
        <button className="w-80 h-80 border-0 toggleElementButton" onClick={()=>toggleDisplay()}>
            {icon}
        </button>
    );
};

export default ToggleElementDisplayButton;
