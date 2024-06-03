/*****************************************************************************
 * @FilePath    : overfloat_modules/PoE_Trade/subwindows/TradeWindow.tsx     *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { IconArrowsMove, IconMinus } from "@tabler/icons-react";
import "../css/PoETrade.css";
import {
    FSEvent,
    FSEventKind,
    WatchManager,
    hideWindow,
    readFile,
    getParameter,
    clipboardWrite,
    inputSimulation,
    simKeyPress,
    Key,
    simKeyDown,
    ModifierKey,
    simKeyUp,
    ShortcutManager,
} from "@OverfloatAPI";
import { useEffect } from "react";
import useStateRef from "react-usestateref";
import TradeDisplay from "../components/TradeDisplay";

type Trade = {
    theirName: string;
    yourItemQuantity: string;
    yourItem: string;
    theirItemQuantity: string;
    theirItem: string;
};

/**
 * Subwindow for displaying the trades.
 */
const TradeWindow: React.FC = () => {
    const clientFilePath = getParameter("clientPath");
    const [trades, setTrades, refTrades] = useStateRef<Trade[]>([]);
    const [_, setSelectedTrade, refSelectedTrade] = useStateRef<number>(0);

    // Regular expressions for parsing trade related messages from client.txt.
    const regexSingleItem =
        /.*@From( <.*\>)? ([^ ]*): Hi, I would like to buy your (.*) listed for (\d+) (.*) in (.*) \(stash tab (.*); position: left (\d+), top (\d+)\)$/;
    const regexBulkItem =
        /.*@From( <.*\>)? ([^ ]*): Hi, I'd like to buy your ([\d]+) (.*) for my (\d+) (.*) in (.*)$/;

    // Handle file changes, only check modifications further.
    const handleFileChange = (event: FSEvent) => {
        if (event.eventKind != FSEventKind.Modify) return;
        handleNewMessage();
    };

    // Handle new lines in the client.txt file.
    const handleNewMessage = async () => {
        if (clientFilePath == null) return;

        // Read the client.txt file.
        const readResult = await readFile(clientFilePath, false);
        if (readResult.successful == false) return;

        // Get the last line from the file.
        const lines = readResult.message.split(/\r?\n/);
        const lastLine = lines[lines.length - 2];

        // Check if the last line is a trade message for a sinlge item.
        const singleTradeMatch = lastLine?.match(regexSingleItem);
        if (singleTradeMatch != null) {
            const newTrade = {
                theirName: singleTradeMatch[2],
                yourItemQuantity: "1",
                yourItem: singleTradeMatch[3],
                theirItemQuantity: singleTradeMatch[4],
                theirItem: singleTradeMatch[5],
            };

            setTrades((prevTrades) => [newTrade, ...prevTrades]);
            return;
        }

        // Check if the last line is a trade message for a bulk items.
        const bulkTradeMatch = lastLine?.match(regexBulkItem);
        if (bulkTradeMatch != null) {
            const newTrade = {
                theirName: bulkTradeMatch[2],
                yourItemQuantity: bulkTradeMatch[3],
                yourItem: bulkTradeMatch[4],
                theirItemQuantity: bulkTradeMatch[5],
                theirItem: bulkTradeMatch[6],
            };

            setTrades((prevTrades) => [newTrade, ...prevTrades]);
            return;
        }
    };

    useEffect(() => {
        // Add shortcuts.
        ShortcutManager.addShortcut("select_next", "Select next trade", "Selects the trade below the one currently selected.", selectNextTrade);
        ShortcutManager.addShortcut("select_previous", "Select previous trade", "Selects the trade above the one currently selected.", selectPreviousTrade);
        ShortcutManager.addShortcut("invite_to_party", "Invite to party", "Invites the player to a party.", inviteToParty);
        ShortcutManager.addShortcut("initiate_trade", "Initiate trade", "Initiates a trade with the player.", initiateTrade);

        // Watch the client.txt file for changes if it was set.
        if (clientFilePath == null) return;
        WatchManager.watchPath(
            "ClientWatcher",
            clientFilePath,
            handleFileChange
        );
    }, []);

    // Executes the simulation sequence that pastes the clipboard content to the chat.
    const pasteClipboardToChat = () => {
        inputSimulation([
            simKeyPress(Key.Return),
            simKeyDown(ModifierKey.LeftControl),
            simKeyPress(Key.V),
            simKeyUp(ModifierKey.LeftControl),
            simKeyPress(Key.Return),
        ]);
    };

    // Functions to select the next and previous trade.
    const selectNextTrade = () => {
        setSelectedTrade((prev) => ((prev + 1) % refTrades.current.length));
    }
    const selectPreviousTrade = () => {
        setSelectedTrade((prev) => ((prev - 1) + refTrades.current.length) % refTrades.current.length);
    }

    // Functions to invite to party and initiate trade.
    const inviteToParty = async () => {
        if(refSelectedTrade.current < 0 || refSelectedTrade.current >=  refTrades.current.length) return;
        
        await clipboardWrite("/invite " + refTrades.current[refSelectedTrade.current].theirName);
        pasteClipboardToChat();
    };

    const initiateTrade = async () => {
        if(refSelectedTrade.current < 0 || refSelectedTrade.current >=  refTrades.current.length) return;

        await clipboardWrite("/tradewith " + refTrades.current[refSelectedTrade.current].theirName);
        pasteClipboardToChat();
    };


    return (
        <div className="window">
            {/* Controls for moving or minimizing the window */}
            <div className="control-bar" data-tauri-drag-region={true}>
                <button
                    className="control-bar-element control-bar-button"
                    onClick={() => hideWindow()}>
                    <IconMinus />
                </button>
                <div
                    className="control-bar-element"
                    data-tauri-drag-region={true}>
                    <IconArrowsMove data-tauri-drag-region={true} />
                </div>
            </div>
                
            {/* Trade display */}
            <div className="trade-container">
                {trades.map((trade, index) => (
                    <TradeDisplay
                        key={index}
                        theirName={trade.theirName}
                        yourItemQuantity={trade.yourItemQuantity}
                        yourItem={trade.yourItem}
                        theirItemQuantity={trade.theirItemQuantity}
                        theirItem={trade.theirItem}
                        selected={index == refSelectedTrade.current}
                    />
                ))}
            </div>
        </div>
    );
};

export default TradeWindow;
