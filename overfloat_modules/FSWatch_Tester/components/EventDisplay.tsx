import { FSEvent, FSEventKind } from "../../../src/services/api"

type EventDisplayProps = {
    event: FSEvent;
}
const EventDisplay: React.FC<EventDisplayProps> = (props: EventDisplayProps) => {
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
    }

    return (
        <div className={"container m-1 "
            + (event.eventKind == FSEventKind.Create ? "bg-success" :
                event.eventKind == FSEventKind.Remove ? "bg-danger" :
                    event.eventKind == FSEventKind.Modify ? "bg-warning" : "bg-info")}
            style={{ borderRadius: "6px" }}>
            <div className="row">
                <div className="col-6">{fsEventKindToString(event.eventKind)}</div>
                <div className="col-6">{event.isDir ? "Directory" : "File"}</div>
            </div>
            {event.eventKind == FSEventKind.Rename ?
                <div>
                    <div className="row">
                        <div className="col">{"New Path: " + event.path}</div>
                    </div>
                    <div className="row">
                        <div className="col">{"Old Path: " + event.pathOld}</div>
                    </div>
                </div>
                :
                <div className="row">
                    <div className="col">{"Path: " + event.path}</div>
                </div>}
        </div>
    )
}

export default EventDisplay;