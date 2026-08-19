#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { composePrompt, randomNpc } from "../src/index.js";

const server = new McpServer(
  {
    name: "npcsmarket",
    version: "0.2.0-beta.0",
  },
  {
    instructions:
      "NPCsMarket helps Codex users think with historical-mind personas during coding wait time. Use random_npc to choose candidates and compose_prompt to build a concise perspective prompt for the user's topic.",
  },
);

function stripInternalFields(response) {
  const { requestId: _requestId, ...publicResponse } = response;
  return publicResponse;
}

server.registerTool(
  "random_npc",
  {
    title: "Get random NPCs",
    description:
      "Use when the user wants historical-mind candidates for coding, product, strategy, debugging, or reflection. Returns either 1 NPC or 3 candidates to choose from.",
    inputSchema: {
      count: z.number().int().min(1).max(3).optional().default(1),
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  async ({ count }) => {
    const response = stripInternalFields(await randomNpc({ count: count === 3 ? 3 : 1 }));
    return {
      content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      structuredContent: response,
    };
  },
);

server.registerTool(
  "compose_prompt",
  {
    title: "Compose NPC prompt",
    description:
      "Use when the user has a topic and wants a specific historical NPC to advise, debate, or question their thinking.",
    inputSchema: {
      topic: z.string().min(1).max(800),
      mode: z.enum(["socratic", "debate", "advisor"]).optional().default("socratic"),
      npcName: z.string().min(1).optional(),
      npcSlug: z.string().min(1).optional(),
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  async ({ topic, mode, npcName, npcSlug }) => {
    const response = stripInternalFields(await composePrompt({ topic, mode, npcName, npcSlug }));
    return {
      content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      structuredContent: response,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
