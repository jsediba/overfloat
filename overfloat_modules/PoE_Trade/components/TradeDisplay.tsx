import {
    IconArrowsExchange,
    IconCircleX,
    IconMinus,
    IconPlus,
    IconUserPlus,
} from "@tabler/icons-react";

type TradeDisplayProps = {
    yourItems: string;
    theirItems: string;
};

const TradeDisplay: React.FC<TradeDisplayProps> = (
    props: TradeDisplayProps
) => {
    const yourItems = props["yourItems"];
    const theirItems = props["theirItems"];

    return (
        <div className="container bg-secondary rounded text-white mt-2">
            <div className="row pt-3">
                <div className="col-1 m-auto">
                    <IconMinus />
                </div>
                <div className="col m-auto">{yourItems}</div>
                <div className="col-1 m-auto">
                    <IconArrowsExchange />
                </div>
                <div className="col text-end m-auto">{theirItems}</div>
                <div className="col-1 m-auto">
                    <IconPlus />
                </div>
            </div>
            <hr />
            <div className="row pb-3">
                <div className="col-2 text-center">
                    <button className="btn btn-secondary border">
                        <IconUserPlus />
                    </button>
                </div>
                <div className="col-2 text-center">
                    <button className="btn btn-secondary border">
                        <IconArrowsExchange />
                    </button>
                </div>
                <div className="col text-end">
                    <button className="btn btn-secondary border">
                        <IconCircleX />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TradeDisplay;