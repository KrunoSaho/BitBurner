import { collectServerNames } from "./all-server-hack.js";
import { NS } from "./index";

export async function main(ns: NS) {
    let [servers, paths] = collectServerNames(ns);
}
