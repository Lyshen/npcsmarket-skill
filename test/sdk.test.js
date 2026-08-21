import test from "node:test";
import assert from "node:assert/strict";

import {
  composePrompt,
  sendFeedback,
  shareConversation,
  trackEvent,
} from "../src/index.js";
import { getJson, postJson } from "../src/http.js";

const TEST_CLIENT_ID = "6ac8e6a1-6863-4ee4-86ff-91be38a683bf";

test("getJson sends request and parses body", async () => {
  let calledUrl = "";
  const body = await getJson("/v1/random?count=1", {
    baseUrl: "https://example.com",
    fetchImpl: async (url) => {
      calledUrl = url;
      return new Response(JSON.stringify({ ok: true, items: [] }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });

  assert.equal(calledUrl, "https://example.com/v1/random?count=1");
  assert.equal(body.ok, true);
});

test("postJson sends payload", async () => {
  let sentBody = "";
  await postJson(
    "/v1/events",
    { eventName: "skill_open" },
    {
      baseUrl: "https://example.com",
      fetchImpl: async (_url, init) => {
        sentBody = String(init.body);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  );

  assert.equal(JSON.parse(sentBody).eventName, "skill_open");
});

test("postJson throws API error message", async () => {
  await assert.rejects(
    postJson(
      "/v1/events",
      { eventName: "x" },
      {
        baseUrl: "https://example.com",
        fetchImpl: async () =>
          new Response(
            JSON.stringify({
              ok: false,
              error: "D1 database is not configured",
            }),
            {
              status: 500,
              headers: { "content-type": "application/json" },
            },
          ),
      },
    ),
    /D1 database is not configured/,
  );
});

test("composePrompt sends minimal client identity", async () => {
  let sentBody = "";
  await composePrompt(
    { topic: "AI strategy", npcSlug: "sun-tzu", mode: "advisor" },
    {
      baseUrl: "https://example.com",
      clientId: TEST_CLIENT_ID,
      fetchImpl: async (_url, init) => {
        sentBody = String(init.body);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  );

  assert.deepEqual(JSON.parse(sentBody), {
    topic: "AI strategy",
    mode: "advisor",
    clientId: TEST_CLIENT_ID,
    source: "codex-plugin",
    npcSlug: "sun-tzu",
  });
});

test("composePrompt ignores malformed client identity overrides", async () => {
  let sentBody = "";
  await composePrompt(
    { topic: "AI strategy", npcSlug: "sun-tzu" },
    {
      baseUrl: "https://example.com",
      clientId: "client-123",
      fetchImpl: async (_url, init) => {
        sentBody = String(init.body);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  );

  assert.notEqual(JSON.parse(sentBody).clientId, "client-123");
});

test("trackEvent sends minimal client identity", async () => {
  let sentBody = "";
  await trackEvent(
    {
      eventName: "skill_open",
      npcSlug: "meadows",
      metadata: { mode: "debate" },
    },
    {
      baseUrl: "https://example.com",
      clientId: TEST_CLIENT_ID,
      fetchImpl: async (_url, init) => {
        sentBody = String(init.body);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  );

  assert.deepEqual(JSON.parse(sentBody), {
    eventName: "skill_open",
    npcSlug: "meadows",
    metadata: { mode: "debate" },
    clientId: TEST_CLIENT_ID,
    source: "codex-plugin",
  });
});

test("shareConversation requires explicit consent", async () => {
  await assert.rejects(
    shareConversation({
      npcName: "Donella Meadows",
      topic: "Writing",
      title: "Writing as context reconstruction",
      excerpt: "Approved excerpt.",
    }),
    /consent: true/,
  );
});

test("shareConversation sends minimal public excerpt payload", async () => {
  let sentBody = "";
  await shareConversation(
    {
      consent: true,
      npcName: "Donella Meadows",
      npcSlug: "meadows",
      topic: "Writing as a thinking channel",
      title: "Writing as context reconstruction",
      excerpt: "A user-approved public excerpt.",
    },
    {
      baseUrl: "https://example.com",
      clientId: TEST_CLIENT_ID,
      fetchImpl: async (_url, init) => {
        sentBody = String(init.body);
        return new Response(
          JSON.stringify({
            ok: true,
            share: { id: "abc123", url: "https://example.com/s/abc123" },
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        );
      },
    },
  );

  assert.deepEqual(JSON.parse(sentBody), {
    consent: true,
    npcName: "Donella Meadows",
    topic: "Writing as a thinking channel",
    title: "Writing as context reconstruction",
    excerpt: "A user-approved public excerpt.",
    clientId: TEST_CLIENT_ID,
    source: "codex-plugin",
    npcSlug: "meadows",
  });
});

test("sendFeedback rejects invalid sentiment", async () => {
  await assert.rejects(
    sendFeedback({
      sentiment: "maybe",
      note: "Not sure.",
    }),
    /good, bad, or other/,
  );
});

test("sendFeedback sends minimal experience payload", async () => {
  let sentBody = "";
  await sendFeedback(
    {
      sentiment: "bad",
      npcSlug: "meadows",
      note: "The persona broke voice.",
    },
    {
      baseUrl: "https://example.com",
      clientId: TEST_CLIENT_ID,
      fetchImpl: async (_url, init) => {
        sentBody = String(init.body);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  );

  assert.deepEqual(JSON.parse(sentBody), {
    sentiment: "bad",
    clientId: TEST_CLIENT_ID,
    source: "codex-plugin",
    npcSlug: "meadows",
    note: "The persona broke voice.",
  });
});

test("sendFeedback sends contact email only when explicitly provided", async () => {
  let sentBody = "";
  await sendFeedback(
    {
      sentiment: "good",
      npcSlug: "meadows",
      note: "Please follow up.",
      contactEmail: "user@example.com",
    },
    {
      baseUrl: "https://example.com",
      clientId: TEST_CLIENT_ID,
      fetchImpl: async (_url, init) => {
        sentBody = String(init.body);
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  );

  assert.deepEqual(JSON.parse(sentBody), {
    sentiment: "good",
    clientId: TEST_CLIENT_ID,
    source: "codex-plugin",
    npcSlug: "meadows",
    note: "Please follow up.",
    contactEmail: "user@example.com",
  });
});
