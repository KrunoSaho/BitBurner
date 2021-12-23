/**
 * A single, fully upgraded (from the point in the game I am in), costs:
 * Level: $16.210m
 * Ram: $3.227m
 * Core: $222.536m
 * Total: $241.973m
 * @ 38,461k/s = (241.973e6/38.461e3)/3600 = 1.7476 hours to break even
 * The "$38,461" figure comes from in game, and increases with the governor augment and a few others.
 */

import { Hacknet, NodeStats, NS } from "./index";

/********************************* Util ********************************/
function* getHackNodes(ns: NS) {
    const hn: Hacknet = ns.hacknet;

    for (let i = 0; i < hn.numNodes(); i++) {
        yield hn.getNodeStats(i);
    }
}

function getNodeId(node: NodeStats): number {
    const data = node.name.split("-");
    return <number>(<unknown>data[data.length - 1]);
}

function upgradeNode(ns: NS, node: NodeStats) {
    let idx = getNodeId(node);
    ns.hacknet.upgradeRam(idx, 200);
    ns.hacknet.upgradeCore(idx, 200);
    ns.hacknet.upgradeLevel(idx, 200);
    return true;
}

/********************************* Upgrade Score ********************************/

function upgradeScore(ns: NS, node: NodeStats, idx: number) {
    let ramUpgrade = 64 - node.ram;
    let cpuUpgrade = 16 - node.cores;
    let lvlUpgrade = 200 - node.level;

    return (
        Math.pow(ramUpgrade, 3) + // most important
        Math.pow(cpuUpgrade, 2) + // to least important
        (lvlUpgrade < 100 ? Math.pow(lvlUpgrade, 4) : lvlUpgrade)
    );
}

/********************************* Main ******************************* */
export async function main(ns: NS) {
    let hn = ns.hacknet;

    while (hn.numNodes() == 0) {
        ns.print("No nodes to upgrade! Trying to purchase...");

        if (ns.getPlayer().money > hn.getPurchaseNodeCost()) {
            hn.purchaseNode();
            break;
        }
        await ns.sleep(1000);
    }

    while (true) {
        let nodes = getHackNodes(ns);

        for (let n of nodes) {
            if (upgradeNode(ns, n)) ns.print(`Hack Node ${n.name} upgraded!`);
        }

        hn.purchaseNode();

        await ns.sleep(1000);
    }
}
