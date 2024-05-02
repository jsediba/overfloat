/*****************************************************************************
 * @FilePath    : overfloat_modules/PoE_Trade/PoE_Trade.tsx                  *
 * @Author      : Jakub Šediba <xsedib00@vutbr.cz>                           *
 * @Year        : 2024                                                       *
 ****************************************************************************/

import { IconMinimize } from "@tabler/icons-react";
import { ModuleWindow } from "../../src/Api/OverfloatAPI";
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