/*****************************************************************************
 * @FilePath    : overfloat_modules/PoE_Trade/components/TradeDisplay.tsx    *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import {
    IconArrowsExchange,
    IconCircleX,
    IconMinus,
    IconPlus,
    IconUserPlus,
} from "@tabler/icons-react";

type TradeDisplayProps = {
    yourItem: string;
    yourItemQuantity: string;
    theirItem: string;
    theirItemQuantity: string;
    theirName: string;
};

const TradeDisplay: React.FC<TradeDisplayProps> = (
    props: TradeDisplayProps
) => {
    const yourItem = props["yourItem"];
    const yourItemQuantity = props["yourItemQuantity"];
    const theirItem = props["theirItem"];
    const theirItemQuantity = props["theirItemQuantity"];
    const theirName = props["theirName"];

    return (
        <div className="container bg-secondary rounded text-white mt-2">
            <div className="row">
                <div className="col">{theirName}</div>
            </div>
            <div className="row pt-3">
                <div className="col-1 m-auto">
                    <IconMinus />
                </div>
                <div className="col m-auto">{yourItemQuantity + "x " + yourItem}</div>
                <div className="col-1 m-auto">
                    <IconArrowsExchange />
                </div>
                <div className="col text-end m-auto">{theirItemQuantity + "x " + theirItem}</div>
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