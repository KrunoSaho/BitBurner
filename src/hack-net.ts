import { Hacknet, NodeStats, NS } from "./index";

function getHackNodes(ns: NS) {
    let hn: Hacknet = ns.hacknet;

    let data: Array<NodeStats> = [];

    for (let i = 0; i < hn.numNodes(); i++) {
        data.push(hn.getNodeStats(i));
    }

    return data;
}

function upgradeScore(ns: NS, node: NodeStats, idx: number) {
    let ramUpgrade = ns.hacknet.getRamUpgradeCost(idx, 2);
    let cpuUpgrade = ns.hacknet.getCoreUpgradeCost(idx, 2);
    let lvlUpgrade = ns.hacknet.getLevelUpgradeCost(idx, 10);

    if (!Number.isFinite(ramUpgrade) && !Number.isFinite(cpuUpgrade) && !Number.isFinite(lvlUpgrade)) {
        return -1;
    }

    return Math.pow(ramUpgrade, 3) + Math.pow(cpuUpgrade, 2) + (lvlUpgrade < 100 ? Math.pow(lvlUpgrade, 4) : lvlUpgrade);
}

function upgradeNode(ns: NS, node, idx: number) {
    if (!ns.hacknet.upgradeRam(idx, 2)) {
        if (!ns.hacknet.upgradeCore(idx, 2)) {
            if (!ns.hacknet.upgradeLevel(idx, 10)) {
                return false;
            }
        }
    }

    return true;
}

function upgrade(ns: NS) {
    let nodes = getHackNodes(ns);

    nodes // upgrade
        .map((n, idx) => <[NodeStats, number, number]>[n, idx, upgradeScore(ns, n, idx)])
        .sort((a, b) => b[2] - a[2])
        .forEach(([n, i, score]) => {
            if (upgradeNode(ns, n, i)) ns.print(`Hack Node ${i} upgraded!`);
        });
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

    while (true) {
        upgrade(ns);
        hn.purchaseNode();

        await ns.sleep(1000);
    }
}
