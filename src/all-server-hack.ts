import { NS } from "./index";

export function collectServerNames(ns: NS): [string[], Map<string, string[]>] {
    const fromServers: string[] = ["home"];
    const checkedServers: string[] = [];
    const serverConnections = new Map();

    for (let i = 0; i < 1000; i++) {
        // 'infinite' loop
        if (fromServers.length == 0) {
            break;
        }

        let server = fromServers.pop()!;
        checkedServers.push(server);

        serverConnections.set(server, []);

        for (let conServer of ns.scan(server)) {
            if (conServer == ".") {
                continue;
            }

            serverConnections.get(server).push(conServer);

            if (!checkedServers.includes(conServer)) {
                fromServers.push(conServer);
            }
        }
    }

    checkedServers.shift(); // remove home
    return [checkedServers, serverConnections];
}

export function findPathToHome(targetServer: string, serverCons: Map<string, string[]>) {
    const path: string[] = [];
    let target = targetServer;

    // check every value for targetServer, store the key
    for (let i = 0; i < 100; i++) {
        // 'infinite' loop
        if (target == "home") {
            break;
        }

        find_keys: {
            for (let server of serverCons.keys()) {
                let serversToSearch = serverCons.get(server)!;

                if (serversToSearch.includes(target)) {
                    if (!path.includes(server)) {
                        path.unshift(server);
                        target = server;
                    }
                    break find_keys;
                }
            }
        }
    }

    return path;
}

/** @param {NS} ns **/
export async function main(ns: NS) {
    // Collect all the servers recursively
    let [servers, serverCons] = collectServerNames(ns);

    // Sort them by `hackAnalyzeChance`
    servers.sort((a, b) => ns.hackAnalyzeChance(a) - ns.hackAnalyzeChance(b));

    // Open their ports + nuke them
    servers.forEach((s) => {
        let portsOpened = 0;

        if (ns.fileExists("BruteSSH.exe")) {
            ns.brutessh(s);
            portsOpened += 1;
        }
        if (ns.fileExists("HTTPWorm.exe")) {
            ns.httpworm(s);
            portsOpened += 1;
        }
        if (ns.fileExists("FTPCrack.exe")) {
            ns.ftpcrack(s);
            portsOpened += 1;
        }
        if (ns.fileExists("relaySMTP.exe")) {
            ns.relaysmtp(s);
            portsOpened += 1;
        }
        if (ns.fileExists("SQLInject.exe")) {
            ns.sqlinject(s);
            portsOpened += 1;
        }

        if (ns.getServerNumPortsRequired(s) <= portsOpened) {
            ns.nuke(s);
        } else {
            ns.tprint(`Couldn't open enough ports on: ${s}`);
        }
    });

    // Backdoor
    for (let s of servers) {
        if (ns.hasRootAccess(s)) {
            if (ns.getPlayer().hacking < ns.getServerRequiredHackingLevel(s)) {
                continue;
            }

            // Connect to each server
            let path = findPathToHome(s, serverCons);

            for (let server of path) {
                ns.connect(server);
            }

            await ns.installBackdoor();

            ns.connect("home");
        }
    }

    ns.connect("home");
}
