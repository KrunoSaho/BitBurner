import { NS } from "./index";

export async function main(ns: NS) {
    ns.scriptKill("grow-servers.js", "home");
    ns.scriptKill("weaken-servers.js", "home");
    ns.scriptKill("hack-servers.js", "home");
    ns.scriptKill("milk-servers.js", "home");

    ns.scriptKill("live-update-files.js", "home");

    ns.run("live-update-files.js");
    ns.run("all-server-hack.js");
    ns.run("milk-servers.js");
}
