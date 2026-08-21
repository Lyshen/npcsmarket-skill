import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const home = mkdtempSync(path.join(os.tmpdir(), "npcsmarket-home-"));

process.env.HOME = home;

const { getClientId } = await import("../src/client-id.js");
const configFile = path.join(home, ".npcsmarket-skill", "config.json");

test("getClientId creates and persists a UUID", () => {
  const clientId = getClientId();
  const config = JSON.parse(readFileSync(configFile, "utf8"));

  assert.match(clientId, UUID_PATTERN);
  assert.equal(config.clientId, clientId);
});

test("getClientId reuses an existing UUID", () => {
  const existing = "6ac8e6a1-6863-4ee4-86ff-91be38a683bf";
  writeFileSync(configFile, `${JSON.stringify({ clientId: existing })}\n`, "utf8");

  assert.equal(getClientId(), existing);
});

test("getClientId replaces a malformed persisted value", () => {
  writeFileSync(configFile, `${JSON.stringify({ clientId: "client-123" })}\n`, "utf8");

  const clientId = getClientId();
  const config = JSON.parse(readFileSync(configFile, "utf8"));

  assert.match(clientId, UUID_PATTERN);
  assert.notEqual(clientId, "client-123");
  assert.equal(config.clientId, clientId);
});
