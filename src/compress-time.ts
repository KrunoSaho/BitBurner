import { NS } from "./index";

const modifiedDate = new Date();
let modifier = 100000000;

const original = Date.prototype;
let time = 0;

// @ts-ignore
Date = function () {
    let curDate = modifiedDate;
    modifiedDate.setTime(modifiedDate.getTime() + modifier);
    time += 1;
    return curDate;
};

export async function main(ns: NS) {}
