import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { createBootstrapCommand, readPackageSpec } from "../bin/npc-skill-mcp-bootstrap.js";

function makePackageRoot(version = "9.9.9") {
  const rootDir = mkdtempSync(path.join(os.tmpdir(), "npcsmarket-bootstrap-"));
  mkdirSync(path.join(rootDir, "bin"), { recursive: true });
  writeFileSync(
    path.join(rootDir, "package.json"),
    `${JSON.stringify({ name: "@npcsmarket/skill", version }, null, 2)}\n`,
    "utf8",
  );
  return rootDir;
}

test("readPackageSpec uses package.json name and version", () => {
  const rootDir = makePackageRoot("1.2.3");

  assert.equal(readPackageSpec(rootDir), "@npcsmarket/skill@1.2.3");
});

test("createBootstrapCommand falls back to the current package version", () => {
  const rootDir = makePackageRoot("1.2.3");

  assert.deepEqual(createBootstrapCommand(rootDir), {
    command: "npx",
    args: ["-y", "-p", "@npcsmarket/skill@1.2.3", "npc-skill-mcp"],
    cwd: rootDir,
  });
});

test("createBootstrapCommand prefers the local server when dependencies are installed", () => {
  const rootDir = makePackageRoot("1.2.3");
  mkdirSync(path.join(rootDir, "node_modules", "@modelcontextprotocol", "sdk"), {
    recursive: true,
  });
  mkdirSync(path.join(rootDir, "node_modules", "zod"), { recursive: true });
  writeFileSync(
    path.join(rootDir, "node_modules", "@modelcontextprotocol", "sdk", "package.json"),
    "{}\n",
    "utf8",
  );
  writeFileSync(path.join(rootDir, "node_modules", "zod", "package.json"), "{}\n", "utf8");

  assert.deepEqual(createBootstrapCommand(rootDir), {
    command: process.execPath,
    args: [path.join(rootDir, "bin", "npc-skill-mcp.js")],
    cwd: rootDir,
  });
});
