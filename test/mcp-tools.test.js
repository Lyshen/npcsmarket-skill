import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("MCP server lists create_share with explicit consent", async () => {
  const client = new Client({ name: "npcsmarket-test", version: "1.0.0" });
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ["bin/npc-skill-mcp.js"],
    cwd: rootDir,
    stderr: "pipe",
  });

  try {
    await client.connect(transport);
    const result = await client.listTools();
    const tool = result.tools.find((item) => item.name === "create_share");

    assert.ok(tool);
    assert.equal(tool.annotations?.readOnlyHint, false);
    assert.equal(tool.annotations?.openWorldHint, true);
    assert.deepEqual(tool.inputSchema.required, [
      "consent",
      "npcName",
      "topic",
      "title",
      "excerpt",
    ]);
    assert.equal(tool.inputSchema.properties?.consent?.const, true);
  } finally {
    await client.close();
  }
});
