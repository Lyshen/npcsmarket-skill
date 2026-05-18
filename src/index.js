import { getClientId } from "./client-id.js";
import { getJson, postJson } from "./http.js";

export { getClientId } from "./client-id.js";

export async function randomNpc(options = {}) {
  const count = options.count === 3 ? 3 : 1;
  return getJson(`/v1/random?count=${count}`, options);
}

export async function composePrompt(input, options = {}) {
  const payload = {
    clientId: getClientId(),
    topic: input.topic,
    mode: input.mode || "socratic",
  };
  if (input.npcSlug) payload.npcSlug = input.npcSlug;
  if (input.npcName) payload.npcName = input.npcName;
  return postJson("/v1/compose", payload, options);
}

export async function trackEvent(input, options = {}) {
  return postJson(
    "/v1/events",
    {
      clientId: getClientId(),
      eventName: input.eventName,
      npcSlug: input.npcSlug,
      metadata: input.metadata || {},
    },
    options,
  );
}
