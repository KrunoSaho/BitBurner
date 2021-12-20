import { NS } from "./index";
import { collectServerNames } from "./all-server-hack";

export async function main(ns: NS) {
    const host = "home";
    const [allServers, serverPaths] = collectServerNames(ns);

    let profitableServers = allServers.filter((s) => {
        ns.getServerGrowth(s) > 40;
    });

    const [usedRam, maxRam] = [ns.getServerUsedRam(host), ns.getServerMaxRam(host)];
    const availableRam = maxRam - usedRam;
    const maxScriptUsage = Math.max(
        ns.getScriptRam("grow-server.js", host),
        ns.getScriptRam("weaken-server.js", host),
        ns.getScriptRam("hack-server.js", host)
    );
    const jobCount = 3;
    const serverCount = profitableServers.length;
    const threads = Math.floor(availableRam / maxScriptUsage / jobCount / serverCount);

    const jobsToRun = ["grow-server.js", "weaken-server.js", "hack-server.js"];

    while (true) {
        for (let target of profitableServers) {
            for (let job in jobsToRun) {
                if (ns.isRunning(job, host, target, threads.toString())) {
                    continue;
                }

                ns.run(job, threads, target, threads.toString());
            }
        }

        await ns.sleep(1000);
    }
}
