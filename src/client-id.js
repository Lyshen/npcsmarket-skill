import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

import { CONFIG_DIR, CONFIG_FILE } from "./config.js";

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
  if (typeof config.clientId === "string" && config.clientId.length > 0) {
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
