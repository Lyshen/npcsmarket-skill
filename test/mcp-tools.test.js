import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("MCP server lists write tools with explicit contracts", async () => {
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
    const createShare = result.tools.find((item) => item.name === "create_share");
    const sendFeedback = result.tools.find((item) => item.name === "send_feedback");

    assert.ok(createShare);
    assert.equal(createShare.annotations?.readOnlyHint, false);
    assert.equal(createShare.annotations?.openWorldHint, true);
    assert.deepEqual(createShare.inputSchema.required, [
      "consent",
      "npcName",
      "topic",
      "title",
      "excerpt",
    ]);
    assert.equal(createShare.inputSchema.properties?.consent?.const, true);

    assert.ok(sendFeedback);
    assert.equal(sendFeedback.annotations?.readOnlyHint, false);
    assert.equal(sendFeedback.annotations?.openWorldHint, true);
    assert.deepEqual(sendFeedback.inputSchema.required, ["sentiment"]);
    assert.deepEqual(sendFeedback.inputSchema.properties?.sentiment?.enum, [
      "good",
      "bad",
      "other",
    ]);
  } finally {
    await client.close();
  }
});
