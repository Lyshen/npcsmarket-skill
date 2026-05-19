# npcsmarket-skill

Thin npm skill client for `https://npcsmarket.com/v1/*`.

## MVP scope

- `random`: get 1 or 3 random NPCs.
- `compose`: generate standardized prompt bundle from topic + NPC.
- `event`: send lightweight tracking event.
- transparent local `client_id` persisted in `~/.npcsmarket-skill/config.json`.

## Install

```bash
npm i @npcsmarket/skill
```

CLI global usage:

```bash
npm i -g @npcsmarket/skill
npc-skill random --count 3
```

## CLI usage

```bash
npc-skill random --count 1 --json
npc-skill random --count 3
```

```bash
npc-skill compose \
  --name "Sun Tzu" \
  --topic "How should we validate demand for this skill?" \
  --mode advisor \
  --json
```

```bash
npc-skill event --name skill_compose --slug sun-tzu --meta '{"source":"cli"}'
```

```bash
npc-skill id
npc-skill id --reset
```

## MCP server usage (for Codex Chat and other MCP clients)

After install, run local MCP server:

```bash
npc-skill-mcp
```

Available MCP tools:

- `random_npc`
- `compose_prompt`
- `track_event`

Example Codex MCP config snippet:

```json
{
  "mcpServers": {
    "npcsmarket-skill": {
      "command": "npc-skill-mcp"
    }
  }
}
```

### Codex quick setup

```bash
npm i -g @npcsmarket/skill@latest
codex mcp add npcsmarket-skill -- npc-skill-mcp
codex mcp list
```

### Claude Code quick setup

```bash
npm i -g @npcsmarket/skill@latest
claude mcp add --scope user npcsmarket-skill -- npc-skill-mcp
claude mcp list
```

### Chat smoke prompt (Codex / Claude Code)

Use this single prompt to validate the full flow without hardcoding an NPC name:

`Call random_npc with count 3, pick one candidate automatically, then call compose_prompt in debate mode using topic: "If AI skills are free, where does value concentrate and who captures it over time?" Finally call track_event with eventName "skill_compose".`

Optional base URL override:

```bash
npc-skill random --base-url https://npcsmarket.com
```

## SDK usage

```js
import { randomNpc, composePrompt, trackEvent } from "@npcsmarket/skill";

const random = await randomNpc({ count: 3 });
const bundle = await composePrompt({
  npcName: "Sun Tzu",
  topic: "API versioning strategy",
  mode: "advisor",
});
await trackEvent({ eventName: "skill_compose", npcSlug: "sun-tzu" });
```

## Development

```bash
npm install
npm test
```

## Release and publish

1. Update version:

```bash
npm version patch
```

2. Verify:

```bash
npm test
npm pack
```

3. Publish to npm (public):

```bash
npm login
npm publish --access public
```

4. Validate:

```bash
npm view @npcsmarket/skill version
```

## Privacy

The package sends only lightweight usage metadata (`client_id`, event name, optional npc slug, optional custom metadata). It does not upload full conversation content by default.
