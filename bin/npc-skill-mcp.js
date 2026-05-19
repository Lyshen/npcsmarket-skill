#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { composePrompt, randomNpc, trackEvent } from "../src/index.js";

const server = new McpServer({
  name: "@npcsmarket/skill-mcp",
  version: "0.1.0",
});

server.tool(
  "random_npc",
  "Get one random NPC or a list of 3 random NPCs.",
  {
    count: z.number().int().min(1).max(3).optional().default(1),
    baseUrl: z.string().url().optional(),
  },
  async ({ count, baseUrl }) => {
    const response = await randomNpc({ count: count === 3 ? 3 : 1, baseUrl });
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
      structuredContent: response,
    };
  },
);

server.tool(
  "compose_prompt",
  "Create a prompt bundle for an NPC with topic and mode.",
  {
    topic: z.string().min(1).max(800),
    mode: z.enum(["socratic", "debate", "advisor"]).optional().default("socratic"),
    npcName: z.string().min(1).optional(),
    npcSlug: z.string().min(1).optional(),
    baseUrl: z.string().url().optional(),
  },
  async ({ topic, mode, npcName, npcSlug, baseUrl }) => {
    const response = await composePrompt({ topic, mode, npcName, npcSlug }, { baseUrl });
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
      structuredContent: response,
    };
  },
);

server.tool(
  "track_event",
  "Send a lightweight analytics event.",
  {
    eventName: z.string().min(1).max(120),
    npcSlug: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
    baseUrl: z.string().url().optional(),
  },
  async ({ eventName, npcSlug, metadata, baseUrl }) => {
    const response = await trackEvent({ eventName, npcSlug, metadata }, { baseUrl });
    return {
      content: [{ type: "text", text: JSON.stringify(response) }],
      structuredContent: response,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
