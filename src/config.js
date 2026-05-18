import os from "node:os";
import path from "node:path";

export const DEFAULT_BASE_URL = "https://npcsmarket.com";
export const CONFIG_DIR = path.join(os.homedir(), ".npcsmarket-skill");
export const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
