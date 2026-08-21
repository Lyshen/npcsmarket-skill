#!/usr/bin/env node

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptPath = fileURLToPath(import.meta.url);
const defaultRootDir = path.resolve(path.dirname(scriptPath), "..");

export function hasInstalledDependencies(rootDir) {
  return (
    existsSync(path.join(rootDir, "node_modules", "@modelcontextprotocol", "sdk", "package.json")) &&
    existsSync(path.join(rootDir, "node_modules", "zod", "package.json"))
  );
}

export function readPackageSpec(rootDir) {
  const packageJson = JSON.parse(readFileSync(path.join(rootDir, "package.json"), "utf8"));

  if (!packageJson.name || !packageJson.version) {
    throw new Error("package.json must include name and version");
  }

  return `${packageJson.name}@${packageJson.version}`;
}

export function createBootstrapCommand(rootDir = defaultRootDir) {
  if (hasInstalledDependencies(rootDir)) {
    return {
      command: process.execPath,
      args: [path.join(rootDir, "bin", "npc-skill-mcp.js")],
      cwd: rootDir,
    };
  }

  return {
    command: "npx",
    args: ["-y", "-p", readPackageSpec(rootDir), "npc-skill-mcp"],
    cwd: rootDir,
  };
}

export function runBootstrap(rootDir = defaultRootDir) {
  const { command, args, cwd } = createBootstrapCommand(rootDir);
  const child = spawn(command, args, {
    cwd,
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
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  runBootstrap();
}
