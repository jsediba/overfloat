/*****************************************************************************
 * @FilePath    : overfloat_modules/FSWatch_Tester/components/EventDisplay.tsx*
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { IconFilePencil, IconFilePlus, IconFileSymlink, IconFileX, IconFolderCog, IconFolderPlus, IconFolderSymlink, IconFolderX } from "@tabler/icons-react";
import { FSEvent, FSEventKind } from "@OverfloatAPI";

type EventDisplayProps = {
    event: FSEvent;
};
const EventDisplay: React.FC<EventDisplayProps> = (
    props: EventDisplayProps
) => {
    const event = props["event"];

    const fsEventKindToString = (kind: FSEventKind) => {
        switch (kind) {
            case FSEventKind.Create:
                return "Create";
                break;
            case FSEventKind.Remove:
                return "Remove";
                break;
            case FSEventKind.Modify:
                return "Modify";
                break;
            case FSEventKind.Rename:
                return "Rename";
                break;
        }
    };

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

    const eventToIcon = (event: FSEvent) => {
        if (event.isDir) {
            switch (event.eventKind){
                case FSEventKind.Create:
                return <IconFolderPlus size={48}/>;
                break;
            case FSEventKind.Remove:
                return <IconFolderX size={48}/>;
                break;
            case FSEventKind.Modify:
                return <IconFolderCog size={48} />;
                break;
            case FSEventKind.Rename:
                return <IconFolderSymlink size={48} />;;
                break;
            }
        } else {
            switch (event.eventKind){
                case FSEventKind.Create:
                return <IconFilePlus size={48}/>;
                break;
            case FSEventKind.Remove:
                return <IconFileX size={48}/>;
                break;
            case FSEventKind.Modify:
                return <IconFilePencil size={48} />;
                break;
            case FSEventKind.Rename:
                return <IconFileSymlink size={48} />;;
                break;
            }
        }
    };

    return (
        <div
            className={
                "container m-1 p-2 " + fsEventKindToBgColor(event.eventKind)
            }
            style={{ borderRadius: "6px" }}>
            <div className="row">
                <div className="col-1 m-auto">
                    {eventToIcon(event)}
                </div>
                <div className="col-11">
                    <div className="container">
                        <div className="row">
                            <div className="col text-end small">
                                {event.timestamp.toLocaleString()}
                            </div>
                        </div>
                        {event.eventKind == FSEventKind.Rename ? (
                            <div>
                                <div className="row text-break">
                                    <div className="col-2">From:</div>
                                    <div className="col">{event.pathOld}</div>
                                </div>
                                <div className="row text-break">
                                    <div className="col-2">To:</div>
                                    <div className="col">{event.path}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="row text-break">
                                <div className="col-2">
                                    Path:
                                </div>
                                <div className="col">
                                    {event.path}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div
            className={
                "container m-1 " +
                (event.eventKind == FSEventKind.Create
                    ? "bg-success"
                    : event.eventKind == FSEventKind.Remove
                    ? "bg-danger"
                    : event.eventKind == FSEventKind.Modify
                    ? "bg-warning"
                    : "bg-info")
            }
            style={{ borderRadius: "6px" }}>
            <div className="row">
                <div className="col-6">
                    {fsEventKindToString(event.eventKind)}
                </div>
                <div className="col-6">
                    {event.isDir ? "Directory" : "File"}
                </div>
            </div>
            {event.eventKind == FSEventKind.Rename ? (
                <div>
                    <div className="row">
                        <div className="col">{"New Path: " + event.path}</div>
                    </div>
                    <div className="row">
                        <div className="col">
                            {"Old Path: " + event.pathOld}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="row">
                    <div className="col">{"Path: " + event.path}</div>
                </div>
            )}
        </div>
    );
};

export default EventDisplay;
