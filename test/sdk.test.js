import test from "node:test";
import assert from "node:assert/strict";

import { getJson, postJson } from "../src/http.js";

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
          new Response(JSON.stringify({ ok: false, error: "D1 database is not configured" }), {
            status: 500,
            headers: { "content-type": "application/json" },
          }),
      },
    ),
    /D1 database is not configured/,
  );
});
