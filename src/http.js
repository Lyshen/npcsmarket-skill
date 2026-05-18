import { DEFAULT_BASE_URL } from "./config.js";

function normalizeBaseUrl(baseUrl) {
  return (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

async function parseError(response) {
  try {
    const body = await response.json();
    if (body && typeof body.error === "string") return body.error;
  } catch {
    return `${response.status} ${response.statusText}`;
  }
  return `${response.status} ${response.statusText}`;
}

export async function getJson(path, { baseUrl, fetchImpl = fetch } = {}) {
  const response = await fetchImpl(`${normalizeBaseUrl(baseUrl)}${path}`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export async function postJson(path, payload, { baseUrl, fetchImpl = fetch } = {}) {
  const response = await fetchImpl(`${normalizeBaseUrl(baseUrl)}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}
