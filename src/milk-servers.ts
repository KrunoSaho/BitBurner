import { NS } from "./index";
import { collectServerNames } from "./all-server-hack.js";

function computeThreadCount(ns: NS, host: string, profitableServers: string[]) {
    const serverCount = profitableServers.length;

    const [usedRam, maxRam] = [ns.getServerUsedRam(host), ns.getServerMaxRam(host)];
    const availableRam = maxRam - usedRam;
    const maxScriptUsage = Math.max(
        ns.getScriptRam("grow-server.js", host),
        ns.getScriptRam("weaken-server.js", host),
        ns.getScriptRam("hack-server.js", host)
    );
    const jobCount = 3;

    const threads = Math.floor(availableRam / maxScriptUsage / jobCount / serverCount);

    return threads;
}

export async function main(ns: NS) {
    const host = "home";
    const [allServers, serverPaths] = collectServerNames(ns);

    let profitableServers = allServers
        // map + filter
        .map((s) => [s, ns.getServerRequiredHackingLevel(s), ns.getServerGrowth(s)])
        .filter(([s, hl, g]) => ns.getPlayer().hacking >= hl && g > 40 && ns.hasRootAccess(<string>s))
        .sort((a, b) => <number>a[1] - <number>b[1])
        .map(([s, _, __]) => <string>s);

    ns.print(`${profitableServers.length} servers to milk!`);

    const jobsToRun = ["grow-server.js", "weaken-server.js", "hack-server.js"];
    const threads = computeThreadCount(ns, host, profitableServers);

    while (true) {
        profitableServers.forEach((target) => {
            for (let job of jobsToRun) {
                if (!ns.isRunning(job, host, target, threads.toString())) {
                    ns.run(job, threads, target, threads.toString());
                }
            }
        });

        await ns.sleep(1000);
    }
}
