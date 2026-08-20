#!/usr/bin/env node

import {
  composePrompt,
  getPersonaDossier,
  getClientId,
  randomNpc,
  sendFeedback,
  shareConversation,
  trackEvent,
} from "../src/index.js";
import { resetClientId } from "../src/client-id.js";

function printUsage() {
  process.stdout.write(
    [
      "npc-skill <command> [options]",
      "",
      "Commands:",
      "  random [--count 1|3] [--json]",
      "  dossier --slug <npcSlug> [--json]",
      "  compose --topic <text> [--name <npcName> | --slug <npcSlug>] [--mode socratic|debate|advisor] [--json]",
      "  share --name <npcName> --topic <text> --title <text> --excerpt <text> --consent [--slug <npcSlug>] [--json]",
      "  feedback --sentiment good|bad|other [--slug <npcSlug>] [--note <text>] [--json]",
      "  event --name <eventName> [--slug <npcSlug>] [--meta '{\"k\":\"v\"}'] [--json]",
      "  id [--reset]",
      "",
      "Global options:",
      "  --base-url <url>   Override API base URL",
    ].join("\n"),
  );
}

function getFlag(args, flag) {
  const idx = args.indexOf(flag);
  if (idx < 0) return null;
  return args[idx + 1] ?? null;
}

function hasFlag(args, flag) {
  return args.includes(flag);
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

async function runRandom(args) {
  const countRaw = getFlag(args, "--count");
  const count = countRaw === "3" ? 3 : 1;
  const baseUrl = getFlag(args, "--base-url") ?? undefined;
  const result = await randomNpc({ count, baseUrl });
  if (hasFlag(args, "--json")) return printJson(result);
  const items = Array.isArray(result.items) ? result.items : [];
  for (const item of items) {
    process.stdout.write(`${item.name} (${item.slug})\n${item.tagline}\n\n`);
  }
}

async function runCompose(args) {
  const topic = getFlag(args, "--topic");
  const npcName = getFlag(args, "--name");
  const npcSlug = getFlag(args, "--slug");
  const mode = getFlag(args, "--mode") ?? "socratic";
  const baseUrl = getFlag(args, "--base-url") ?? undefined;

  if (!topic) throw new Error("Missing --topic");
  if (!npcName && !npcSlug) throw new Error("Need --name or --slug");

  const result = await composePrompt({ topic, npcName, npcSlug, mode }, { baseUrl });
  if (hasFlag(args, "--json")) return printJson(result);

  process.stdout.write(
    [
      `NPC: ${result.npc.name} (${result.npc.slug})`,
      `Mode: ${result.bundle.mode}`,
      `Topic: ${result.bundle.topic}`,
      "",
      "Starter Prompt:",
      result.bundle.prompts.starter,
      "",
      "Followups:",
      ...result.bundle.prompts.followups.map((line, idx) => `${idx + 1}. ${line}`),
      "",
    ].join("\n"),
  );
}

async function runDossier(args) {
  const npcSlug = getFlag(args, "--slug");
  const baseUrl = getFlag(args, "--base-url") ?? undefined;

  if (!npcSlug) throw new Error("Missing --slug");

  const result = await getPersonaDossier({ npcSlug }, { baseUrl });
  if (hasFlag(args, "--json")) return printJson(result);

  const dossier = result.dossier;
  process.stdout.write(
    [
      `NPC: ${dossier.npc.name} (${dossier.npc.slug})`,
      `Role: ${dossier.npc.role}`,
      `Tagline: ${dossier.npc.tagline}`,
      "",
      "Reasoning DNA:",
      ...dossier.reasoning.dna.map((line) => `- ${line}`),
      "",
      "Memory:",
      ...dossier.memory.slice(0, 5).map((line) => `- ${line}`),
      "",
    ].join("\n"),
  );
}

async function runEvent(args) {
  const eventName = getFlag(args, "--name");
  const npcSlug = getFlag(args, "--slug") ?? undefined;
  const baseUrl = getFlag(args, "--base-url") ?? undefined;
  const metaRaw = getFlag(args, "--meta");
  let metadata = {};
  if (metaRaw) {
    try {
      metadata = JSON.parse(metaRaw);
    } catch {
      throw new Error("Invalid --meta JSON");
    }
  }
  if (!eventName) throw new Error("Missing --name");
  const result = await trackEvent({ eventName, npcSlug, metadata }, { baseUrl });
  if (hasFlag(args, "--json")) return printJson(result);
  process.stdout.write("ok\n");
}

async function runShare(args) {
  const npcName = getFlag(args, "--name");
  const npcSlug = getFlag(args, "--slug") ?? undefined;
  const topic = getFlag(args, "--topic");
  const title = getFlag(args, "--title");
  const excerpt = getFlag(args, "--excerpt");
  const baseUrl = getFlag(args, "--base-url") ?? undefined;

  if (!hasFlag(args, "--consent")) throw new Error("Missing --consent");
  if (!npcName) throw new Error("Missing --name");
  if (!topic) throw new Error("Missing --topic");
  if (!title) throw new Error("Missing --title");
  if (!excerpt) throw new Error("Missing --excerpt");

  const result = await shareConversation(
    { consent: true, npcName, npcSlug, topic, title, excerpt },
    { baseUrl },
  );
  if (hasFlag(args, "--json")) return printJson(result);
  process.stdout.write(`${result.share.url}\n`);
}

async function runFeedback(args) {
  const sentiment = getFlag(args, "--sentiment");
  const npcSlug = getFlag(args, "--slug") ?? undefined;
  const note = getFlag(args, "--note") ?? undefined;
  const baseUrl = getFlag(args, "--base-url") ?? undefined;

  if (!sentiment) throw new Error("Missing --sentiment");

  const result = await sendFeedback({ sentiment, npcSlug, note }, { baseUrl });
  if (hasFlag(args, "--json")) return printJson(result);
  process.stdout.write("ok\n");
}

function runId(args) {
  const clientId = hasFlag(args, "--reset") ? resetClientId() : getClientId();
  process.stdout.write(`${clientId}\n`);
}

async function main() {
  const [, , command, ...args] = process.argv;
  if (!command || command === "--help" || command === "-h") {
    printUsage();
    process.exit(0);
  }

  try {
    if (command === "random") return await runRandom(args);
    if (command === "dossier") return await runDossier(args);
    if (command === "compose") return await runCompose(args);
    if (command === "share") return await runShare(args);
    if (command === "feedback") return await runFeedback(args);
    if (command === "event") return await runEvent(args);
    if (command === "id") return runId(args);
    printUsage();
    process.exit(1);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}

await main();
