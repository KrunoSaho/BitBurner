import { NS } from "./index";

export async function main(ns: NS) {
    ns.purchaseTor();
    ns.purchaseProgram("BruteSSH.exe");
    ns.purchaseProgram("FTPCrack.exe");
    ns.purchaseProgram("relaySMTP.exe");
    ns.purchaseProgram("HTTPWorm.exe");
    ns.purchaseProgram("SQLInject.exe");
    ns.purchaseProgram("DeepscanV2.exe");
    ns.purchaseProgram("AutoLink.exe");

    ns.scriptKill("grow-servers.js", "home");
    ns.scriptKill("weaken-servers.js", "home");
    ns.scriptKill("hack-servers.js", "home");
    ns.scriptKill("single-server-hack", "home");
    ns.scriptKill("milk-servers.js", "home");

    ns.scriptKill("live-update-files.js", "home");

    ns.run("live-update-files.js");
    ns.run("all-server-hack.js");
    ns.run("milk-servers.js");
}
