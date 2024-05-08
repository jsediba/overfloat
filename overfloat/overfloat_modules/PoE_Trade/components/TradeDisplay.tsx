/*****************************************************************************
 * @FilePath    : overfloat_modules/PoE_Trade/components/TradeDisplay.tsx    *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { IconArrowsExchange, IconUser } from "@tabler/icons-react";

type TradeDisplayProps = {
    yourItem: string;
    yourItemQuantity: string;
    theirItem: string;
    theirItemQuantity: string;
    theirName: string;
    selected: boolean;
};

/**
 * A component for displaying a single trade.
 */
const TradeDisplay: React.FC<TradeDisplayProps> = (
    props: TradeDisplayProps
) => {
    const yourItem = props["yourItem"];
    const yourItemQuantity = props["yourItemQuantity"];
    const theirItem = props["theirItem"];
    const theirItemQuantity = props["theirItemQuantity"];
    const theirName = props["theirName"];
    const selected = props["selected"];

    return (
        <div
            className={
                "container-fluid rounded text-white mt-2" +
                (selected ? " bg-success" : " bg-secondary")
            }>
            <div className="row pt-2 word-break text-end align-items-center">
                <div className="col">
                    {theirName} <IconUser />
                </div>
            </div>
            <hr />
            <div className="row pb-3 text-center align-items-center">
                <div className="col">{yourItemQuantity + "x " + yourItem}</div>
                <div className="col-1">
                    <IconArrowsExchange />
                </div>
                <div className="col">
                    {theirItemQuantity + "x " + theirItem}
                </div>
            </div>
        </div>
    );
};

export default TradeDisplay;
