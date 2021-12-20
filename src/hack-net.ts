import { Hacknet, NodeStats, NS } from "./index";

function getHackNodes(ns: NS) {
    let hn: Hacknet = ns.hacknet;

    let data: Array<NodeStats> = [];

    for (let i = 0; i < hn.numNodes(); i++) {
        data.push(hn.getNodeStats(i));
    }

    return data;
}

async function upgrade(ns: NS) {
    let nodes = getHackNodes(ns);
}

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

    // while (true) {
    hn.purchaseNode();

    await upgrade(ns);

    await ns.sleep(1000);
    // }
}
