import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

import { CONFIG_DIR, CONFIG_FILE } from "./config.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readConfig() {
  try {
    const content = readFileSync(CONFIG_FILE, "utf8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function writeConfig(config) {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

export function getClientId() {
  const config = readConfig();
  if (typeof config.clientId === "string" && UUID_PATTERN.test(config.clientId)) {
    return config.clientId;
  }
  const clientId = randomUUID();
  writeConfig({ ...config, clientId, createdAt: new Date().toISOString() });
  return clientId;
}

export function resetClientId() {
  const config = readConfig();
  const clientId = randomUUID();
  writeConfig({ ...config, clientId, rotatedAt: new Date().toISOString() });
  return clientId;
}
