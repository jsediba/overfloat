/*****************************************************************************
 * @FilePath    : overfloat_modules/FSWatch_Tester/components/EventDisplay.tsx*
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import {
    IconFilePencil,
    IconFilePlus,
    IconFileSymlink,
    IconFileX,
    IconFolderCog,
    IconFolderPlus,
    IconFolderSymlink,
    IconFolderX,
} from "@tabler/icons-react";
import { FSEvent, FSEventKind } from "@OverfloatAPI";

type EventDisplayProps = {
    event: FSEvent;
};

/**
 * Component for displaying a single FileSystem event.
 */
const EventDisplay: React.FC<EventDisplayProps> = (
    props: EventDisplayProps
) => {
    const event = props["event"];

    // Function to convert the event kind to a bootstrap background color class name.
    const fsEventKindToBgColor = (kind: FSEventKind) => {
        switch (kind) {
            case FSEventKind.Create:
                return "bg-success";
                break;
            case FSEventKind.Remove:
                return "bg-danger";
                break;
            case FSEventKind.Modify:
                return "bg-info";
                break;
            case FSEventKind.Rename:
                return "bg-warning";
                break;
        }
    };

    // Function to get an icon that should represent this event.
    const eventToIcon = (event: FSEvent) => {
        if (event.isDir) {
            switch (event.eventKind) {
                case FSEventKind.Create:
                    return <IconFolderPlus size={48} />;
                    break;
                case FSEventKind.Remove:
                    return <IconFolderX size={48} />;
                    break;
                case FSEventKind.Modify:
                    return <IconFolderCog size={48} />;
                    break;
                case FSEventKind.Rename:
                    return <IconFolderSymlink size={48} />;
                    break;
            }
        } else {
            switch (event.eventKind) {
                case FSEventKind.Create:
                    return <IconFilePlus size={48} />;
                    break;
                case FSEventKind.Remove:
                    return <IconFileX size={48} />;
                    break;
                case FSEventKind.Modify:
                    return <IconFilePencil size={48} />;
                    break;
                case FSEventKind.Rename:
                    return <IconFileSymlink size={48} />;
                    break;
            }
        }
    };

    const labelStyle: React.CSSProperties = { width: "50px" };

    return (
        <div
            className={
                "col my-1 p-2 br-2 rounded " +
                fsEventKindToBgColor(event.eventKind)
            }>
            <div className="d-flex">
                <div className="my-auto">{eventToIcon(event)}</div>
                <div className="d-flex flex-column w-100 px-2">
                    <div className="w-100 text-end">
                        {event.timestamp.toLocaleString()}
                    </div>
                    {event.eventKind == FSEventKind.Rename ? (
                        <>
                            <div className="w-100 text-break d-flex">
                                <div style={labelStyle}>From:</div>
                                <div>{event.pathOld}</div>
                            </div>
                            <div className="w-100 text-break d-flex">
                                <div style={labelStyle}>To:</div>
                                <div>{event.path}</div>
                            </div>
                        </>
                    ) : (
                        <div className="w-100 text-break d-flex">
                            <div style={labelStyle}>Path:</div>
                            <div>{event.path}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDisplay;
