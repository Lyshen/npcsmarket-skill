import { getClientId } from "./client-id.js";
import { getJson, postJson } from "./http.js";

export { getClientId } from "./client-id.js";

const CLIENT_SOURCE = "codex-plugin";
const FEEDBACK_SENTIMENTS = new Set(["good", "bad", "other"]);

function withClientIdentity(payload, options = {}) {
  return {
    ...payload,
    clientId: options.clientId || getClientId(),
    source: CLIENT_SOURCE,
  };
}

export async function randomNpc(options = {}) {
  const count = options.count === 3 ? 3 : 1;
  return getJson(`/v1/random?count=${count}`, options);
}

export async function composePrompt(input, options = {}) {
  const payload = withClientIdentity(
    {
      topic: input.topic,
      mode: input.mode || "socratic",
    },
    options,
  );
  if (input.npcSlug) payload.npcSlug = input.npcSlug;
  if (input.npcName) payload.npcName = input.npcName;
  return postJson("/v1/compose", payload, options);
}

export async function trackEvent(input, options = {}) {
  return postJson(
    "/v1/events",
    withClientIdentity(
      {
        eventName: input.eventName,
        npcSlug: input.npcSlug,
        metadata: input.metadata || {},
      },
      options,
    ),
    options,
  );
}

export async function shareConversation(input, options = {}) {
  if (input.consent !== true) {
    throw new Error("shareConversation requires consent: true");
  }

  const payload = withClientIdentity(
    {
      consent: true,
      npcName: input.npcName,
      topic: input.topic,
      title: input.title,
      excerpt: input.excerpt,
    },
    options,
  );
  if (input.npcSlug) payload.npcSlug = input.npcSlug;

  return postJson("/v1/share", payload, options);
}

export async function sendFeedback(input, options = {}) {
  if (!FEEDBACK_SENTIMENTS.has(input.sentiment)) {
    throw new Error("feedback sentiment must be good, bad, or other");
  }

  const payload = withClientIdentity(
    {
      sentiment: input.sentiment,
    },
    options,
  );
  if (input.npcSlug) payload.npcSlug = input.npcSlug;
  if (input.note) payload.note = input.note;

  return postJson("/v1/feedback", payload, options);
}
