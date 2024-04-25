import { IconMinimize } from "@tabler/icons-react";
import { ModuleWindow } from "../../src/Api/ModuleWindow";
import TradeDisplay from "./components/TradeDisplay";

const PoETrade: React.FC = () => {
    return(
        <ModuleWindow>
            <button className="btn btn-secondary">
                <IconMinimize />
            </button>
            <TradeDisplay yourItems="Nimis, Topaz Ring" theirItems="127x Divine Orb"/>
            <TradeDisplay yourItems="12x Ambush Scarab of Discernment" theirItems="40x Chaos Orb"/>
        </ModuleWindow>
    )


}

export default PoETrade;