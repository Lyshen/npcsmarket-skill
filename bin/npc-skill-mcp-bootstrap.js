#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localServer = path.join(rootDir, "bin", "npc-skill-mcp.js");
const hasLocalDependencies =
  existsSync(path.join(rootDir, "node_modules", "@modelcontextprotocol", "sdk", "package.json")) &&
  existsSync(path.join(rootDir, "node_modules", "zod", "package.json"));

const command = hasLocalDependencies ? process.execPath : "npx";
const args = hasLocalDependencies
  ? [localServer]
  : ["-y", "-p", "@npcsmarket/skill@0.2.2", "npc-skill-mcp"];

const child = spawn(command, args, {
  cwd: rootDir,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  process.stderr.write(`Failed to start NPCsMarket MCP server: ${error.message}\n`);
  process.exit(1);
});
