#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  composePrompt,
  getPersonaDossier,
  randomNpc,
  sendFeedback,
  shareConversation,
} from "../src/index.js";

const server = new McpServer(
  {
    name: "npcsmarket",
    version: "0.3.0",
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

function dossierVoiceContract(dossier) {
  if (!dossier) return "";
  const dna = Array.isArray(dossier.reasoning?.dna) ? dossier.reasoning.dna.slice(0, 6) : [];
  const memory = Array.isArray(dossier.memory) ? dossier.memory.slice(0, 5) : [];
  const examples = Array.isArray(dossier.examples) ? dossier.examples.slice(0, 2) : [];

  return [
    "",
    "Persona dossier v2:",
    dossier.profile?.legend ? `- Historical frame: ${dossier.profile.legend}` : "",
    dna.length ? `- Reasoning DNA: ${dna.join(" | ")}` : "",
    memory.length ? `- Memory fragments: ${memory.join(" | ")}` : "",
    ...examples.flatMap((item, index) => [
      `- Example ${index + 1} user: ${item.user}`,
      `- Example ${index + 1} persona: ${item.npc}`,
    ]),
  ]
    .filter(Boolean)
    .join("\n");
}

function withCodexVoiceContract(response, dossierResponse) {
  if (!response?.bundle?.prompts?.starter || !response?.npc?.name) return response;
  const dossier = dossierResponse?.dossier;
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
    dossierVoiceContract(dossier),
  ].join("\n");
  return {
    ...response,
    ...(dossier ? { dossier } : {}),
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
  "get_persona_dossier",
  {
    title: "Get persona dossier",
    description:
      "Fetch the v2 persona dossier for a known NPC slug, including legend, reasoning DNA, memory fragments, and examples.",
    inputSchema: {
      npcSlug: z.string().min(1).max(120),
    },
    annotations: {
      readOnlyHint: true,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  async ({ npcSlug }) => {
    const response = stripInternalFields(await getPersonaDossier({ npcSlug }));
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
    const composed = stripInternalFields(await composePrompt({ topic, mode, npcName, npcSlug }));
    let dossier;
    if (composed?.npc?.slug) {
      try {
        dossier = stripInternalFields(await getPersonaDossier({ npcSlug: composed.npc.slug }));
      } catch {
        dossier = undefined;
      }
    }
    const response = withCodexVoiceContract(composed, dossier);
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
      "Report a simple good, bad, or other experience signal for NPCsMarket after the user explicitly gives feedback.",
    inputSchema: {
      sentiment: z.enum(["good", "bad", "other"]),
      npcSlug: z.string().min(1).max(120).optional(),
      note: z.string().min(1).max(1000).optional(),
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: true,
      destructiveHint: false,
    },
  },
  async ({ sentiment, npcSlug, note }) => {
    const response = stripInternalFields(await sendFeedback({ sentiment, npcSlug, note }));
    return {
      content: [{ type: "text", text: JSON.stringify(response, null, 2) }],
      structuredContent: response,
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
