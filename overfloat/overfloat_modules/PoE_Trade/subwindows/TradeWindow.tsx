import { IconArrowsMove, IconMinus } from "@tabler/icons-react";
import "../css/PoETrade.css";
import {
    ModuleWindow,
    FSEvent,
    FSEventKind,
    WatchManager,
    hideWindow,
    readFile,
} from "@OverfloatAPI";
import { useEffect, useState } from "react";
import TradeDisplay from "../components/TradeDisplay";

const TradeWindow: React.FC = () => {
    const clientFilePath = "ClientPath.txt";
    const [trades, setTrades] = useState<React.ReactNode[]>([]);

    const regexSingleItem =
        /.*@From( <.*\>)? ([^ ]*): Hi, I'd like to buy your ([\d]+) (.*) for my (\d+) (.*) in (.*)$/gm;
    const regexBulkItem =
        /.*@From( <.*\>)? ([^ ]*): Hi, I would like to buy your (.*) listed for (\d+) (.*) in (.*) \(stash tab (.*); position: left (\d+), top (\d+)\)$/gm;

    const handleFileChange = (event: FSEvent) => {
        console.log(event);
        if (event.eventKind != FSEventKind.Modify) return;
        handleNewMessage();
    };

    const handleNewMessage = async () => {
        const readResult = await readFile(clientFilePath, false);
        if (readResult.successful == false) return;

        const lastLine = readResult.message.split(/\r?\n/).pop();
        const singleTradeMatch = lastLine?.match(regexSingleItem);
        if (singleTradeMatch != null) {
            const newTrade = (
                <TradeDisplay
                    theirName={singleTradeMatch[2]}
                    yourItem={singleTradeMatch[3]}
                    yourItemQuantity={"1"}
                    theirItem={singleTradeMatch[5]}
                    theirItemQuantity={singleTradeMatch[4]}
                />
            );
            setTrades((prevTrades) => [newTrade, ...prevTrades]);
            return;
        }

        const bulkTradeMatch = lastLine?.match(regexBulkItem);
        if (bulkTradeMatch != null) {
            return;
        }
    };

    useEffect(() => {
        WatchManager.watchPath("client", clientFilePath, handleFileChange);
    });

    return (
        <ModuleWindow showTitleBar={false}>
            <div className="container-fluid p-0">
                <div className="control-bar" data-tauri-drag-region={true}>
                    <button
                        className="control-bar-button"
                        onClick={() => hideWindow()}>
                        <IconMinus />
                    </button>
                    <div
                        className="control-bar-button"
                        data-tauri-drag-region={true}>
                        <IconArrowsMove data-tauri-drag-region={true} />
                    </div>
                </div>
            </div>
            <div className="container">
                {trades.map((trade, index) => (
                    <div key={index}>
                        {trade}
                    </div>
                ))}
            </div>
        </ModuleWindow>
    );
};

export default TradeWindow;
