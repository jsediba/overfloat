/*****************************************************************************
 * @FilePath    : src/components/Modules/ToggleElementDisplayButton.tsx      *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import useStateRef from "react-usestateref";
import { IconCaretUpFilled, IconCaretDownFilled } from "@tabler/icons-react";
import { ReactElement, useState } from "react";
import "./css/Modules.css"

type ToggleElementDisplayButtonProps = {
    id: string;
}

/**
 * React component for a button that toggles the display of an element.
 * Adds a caret icon that changes direction based on the visibility of the element.
 */
const ToggleElementDisplayButton: React.FC<ToggleElementDisplayButtonProps> = (props: ToggleElementDisplayButtonProps) => {
    const id = props["id"];
    
    const [_, setVisible, refVisible] = useStateRef<boolean>(true);
    const [icon, setIcon] = useState<ReactElement>(<IconCaretUpFilled/>);

    /**
     * Toggles the display of the element with the id.
     */
    const toggleDisplay = () => {
        // Get the element with the id
        let element = document.getElementById(id);
        if (element == null) return;
        
        // Toggle the display of the element
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
        <button className="border-0 toggleElementButton" onClick={()=>toggleDisplay()}>
            {icon}
        </button>
    );
};

export default ToggleElementDisplayButton;
