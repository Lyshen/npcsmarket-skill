#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { composePrompt, randomNpc, sendFeedback, shareConversation } from "../src/index.js";

const server = new McpServer(
  {
    name: "npcsmarket",
    version: "0.2.5",
  },
  {
    instructions:
      "NPCsMarket helps Codex users discuss product, design, strategy, marketing, and engineering questions through historical personas and practical thinking modes. Use random_npc to discover candidates and compose_prompt to build a focused prompt for the user's topic. Use create_share only when the user explicitly asks to publish a short approved excerpt. Use send_feedback only when the user explicitly rates the experience or asks you to report feedback.",
  },
);

function stripInternalFields(response) {
  const { requestId: _requestId, ...publicResponse } = response;
  return publicResponse;
}

function withCodexVoiceContract(response) {
  if (!response?.bundle?.prompts?.starter || !response?.npc?.name) return response;
  const voiceContract = [
    "",
    "Codex persona contract:",
    `- Answer in first person as ${response.npc.name}.`,
    `- Do not say "from ${response.npc.name}'s perspective" or "${response.npc.name} would say."`,
    "- Speak directly to the user as the persona.",
    "- Reason through the persona's historical framework, not as a generic strategist.",
    "- Translate the user's modern topic into the persona's native concerns, values, tradeoffs, and blind spots.",
    "- Use the returned character.prompt and framework.steps as the primary reasoning contract.",
    "- Stay in this voice for follow-up debate unless the user asks to leave character.",
  ].join("\n");
  return {
    ...response,
    bundle: {
      ...response.bundle,
      prompts: {
        ...response.bundle.prompts,
        starter: `${response.bundle.prompts.starter}${voiceContract}`,
      },
    },
  };
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
    const response = withCodexVoiceContract(
      stripInternalFields(await composePrompt({ topic, mode, npcName, npcSlug })),
    );
    return {
      content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      structuredContent: response,
    };
  },
);

server.registerTool(
  "create_share",
  {
    title: "Create public share",
    description:
      "Create a public NPCsMarket share page from a short excerpt only after the user explicitly approves publishing that excerpt.",
    inputSchema: {
      consent: z.literal(true),
      npcName: z.string().min(1).max(200),
      topic: z.string().min(1).max(800),
      title: z.string().min(1).max(160),
      excerpt: z.string().min(1).max(4000),
      npcSlug: z.string().min(1).max(120).optional(),
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  async ({ consent, npcName, topic, title, excerpt, npcSlug }) => {
    const response = stripInternalFields(
      await shareConversation({ consent, npcName, topic, title, excerpt, npcSlug }),
    );
    return {
      content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      structuredContent: response,
    };
  },
);

server.registerTool(
  "send_feedback",
  {
    title: "Send feedback",
    description:
      "Report a simple good, bad, or other experience signal for NPCsMarket after the user explicitly gives feedback. Include contactEmail only when the user explicitly agrees to be contacted about the feedback.",
    inputSchema: {
      sentiment: z.enum(["good", "bad", "other"]),
      npcSlug: z.string().min(1).max(120).optional(),
      note: z.string().min(1).max(1000).optional(),
      contactEmail: z.string().email().max(254).optional(),
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  async ({ sentiment, npcSlug, note, contactEmail }) => {
    const response = stripInternalFields(
      await sendFeedback({ sentiment, npcSlug, note, contactEmail }),
    );
    return {
      content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      structuredContent: response,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
