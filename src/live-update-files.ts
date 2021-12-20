// Original script by jaguilar. I have modified this to iron out the bugs.

import { NS } from "./index";

export async function main(ns: NS) {
    while (true) {
        await sync(ns);
        await ns.sleep(5000);
    }
}

async function sync(ns: NS) {
    for (const f of ns.ls("home", "js")) {
        await sync1(ns, f);
    }
}

async function sync1(ns: NS, filename: string) {
    const url = `http://localhost:5500/out/${filename}`;

    const content = new TextDecoder("utf-8").decode(
        await (
            await fetch(url, {
                cache: "no-cache",
            }).catch((e) => new Response())
        ).arrayBuffer()
    );

    if (content.length === 0) return;

    if (content != ns.read(filename)) {
        ns.print(`${filename} updated!`);
        // Clear the script so that the module also gets cleared.
        ns.rm(filename);
        await ns.write(filename, <any>content, "w");
    }
}
