import { NS } from "./index";

export async function main(ns: NS) {
    let [target, threads] = [<string>ns.args[0], <number>ns.args[1]];

    await ns.hack(target, { threads: threads });

    await ns.weaken(target, { threads: threads });

    await ns.grow(target, { threads: threads });

    await ns.weaken(target, { threads: threads });
}
