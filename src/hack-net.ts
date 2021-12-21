import { Hacknet, NodeStats, NS } from "./index";

/********************************* Util ********************************/
function getHackNodes(ns: NS) {
    let hn: Hacknet = ns.hacknet;

    let data: Array<NodeStats> = [];

    for (let i = 0; i < hn.numNodes(); i++) {
        if (
            !(
                Number.isFinite(hn.getRamUpgradeCost(i, 1)) ||
                Number.isFinite(hn.getCoreUpgradeCost(i, 1)) ||
                Number.isFinite(hn.getLevelUpgradeCost(i, 1))
            )
        ) {
            continue;
        }

        data.push(hn.getNodeStats(i));
    }

    return data;
}

function upgradeNode(ns: NS, node: NodeStats, idx: number) {
    if (node.level < 100) {
        return ns.hacknet.upgradeLevel(idx, 50);
    }

    ns.hacknet.upgradeRam(idx, 2);
    ns.hacknet.upgradeCore(idx, 2);
    ns.hacknet.upgradeLevel(idx, 30);

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

        nodes // take scores, order largest to smallest, get the first few, upgrade them!
            .map((n, idx) => <[NodeStats, number, number]>[n, idx, upgradeScore(ns, n, idx)])
            .sort((a, b) => b[2] - a[2])
            .slice(0, 3)
            .forEach(([n, i, _]) => {
                if (upgradeNode(ns, n, i)) ns.print(`Hack Node ${i} upgraded!`);
            });

        hn.purchaseNode();

        await ns.sleep(1000 * 60 * 1);
    }
}
