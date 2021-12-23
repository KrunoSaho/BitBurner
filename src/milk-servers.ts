import { NS } from "./index";
import { collectServerNames } from "./all-server-hack.js";

function computeThreadCount(ns: NS, host: string, profitableServers: string[]) {
    const serverCount = profitableServers.length;

    const jobCount = 1;

    const [usedRam, maxRam] = [ns.getServerUsedRam(host), ns.getServerMaxRam(host)];
    const availableRam = maxRam - usedRam;
    const maxScriptUsage = ns.getScriptRam("single-server-hack.js", host);

    const a = availableRam / maxScriptUsage;
    const b = a / jobCount;
    const threads = Math.floor(b / serverCount);

    return threads;
}

function getProfitableServers(ns: NS) {
    const [allServers, serverPaths] = collectServerNames(ns);

    let profitableServers = allServers
        // map + filter
        .map((s) => [s, ns.getServerRequiredHackingLevel(s), ns.getServerGrowth(s)])
        .filter(([s, hl, g]) => ns.getPlayer().hacking >= hl && g > 40 && ns.hasRootAccess(<string>s))
        .sort((a, b) => <number>b[2] - <number>a[2])
        // .slice(0, 10)
        .map(([s, _, __]) => <string>s);

    ns.print(`${profitableServers.length} servers to milk!`);

    return profitableServers;
}

export async function main(ns: NS) {
    const servers = getProfitableServers(ns);
    const hosts = ns.getPurchasedServers();

    const jobsToRun = ["single-server-hack.js"];

    for (let host of hosts) {
        for (let job of jobsToRun) {
            await ns.scp(job, "home", host);
        }
    }

    hosts.unshift("home");
    const threads = {};

    threads["home"] = computeThreadCount(ns, "home", servers);

    while (true) {
        for (let host of hosts) {
            let threadCount = threads[host];

            if (threadCount == 0) continue;

            servers.forEach((target) => {
                for (let job of jobsToRun) {
                    if (!ns.isRunning(job, host, target, threadCount.toString())) {
                        ns.run(job, threadCount, target, threadCount.toString());
                    }
                }
            });
        }

        await ns.sleep(1000);
    }
}
