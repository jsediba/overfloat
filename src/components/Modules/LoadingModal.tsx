/*****************************************************************************
 * @FilePath    : src/components/Modules/LoadingModal.tsx                    *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { IconLoader2 } from "@tabler/icons-react";

type LoadingModalProps = {
    visible: boolean;
};

/**
 * React component for a loading modal.
 */
const LoadingModal: React.FC<LoadingModalProps> = (
    props: LoadingModalProps
) => {
    const visible = props["visible"];

    // If the modal is not visible, return null
    if (!visible) return null;

    // Return the loading modal if it is visible
    return (
        <div className="loadingModalContainer">
            <IconLoader2 size={48} stroke={3} className="loadingSpinner"/>
        </div>
    );
};

export default LoadingModal;
