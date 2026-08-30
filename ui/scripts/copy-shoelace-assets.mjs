#!/usr/bin/env node
// Shoelace icons/assets need to be served statically. We copy them into
// public/shoelace so they're available at a stable URL (see setBasePath in
// src/main.js) without depending on node_modules being reachable at runtime.
import { cp, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const uiDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(uiDir, "node_modules", "@shoelace-style", "shoelace", "dist", "assets");
const dest = path.join(uiDir, "public", "shoelace", "assets");

await mkdir(path.dirname(dest), { recursive: true });
await cp(source, dest, { recursive: true });
console.log("Shoelace assets скопированы в public/shoelace/assets");
