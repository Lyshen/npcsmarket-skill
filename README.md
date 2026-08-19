# NPCsMarket Codex Plugin

Think with historical minds while Codex works.

NPCsMarket is a Codex plugin beta for the small pockets of time when installs, tests, builds, reviews, or agent tasks are running. Ask Turing about a stubborn bug, Sun Tzu about launch scope, or let NPCsMarket pick three perspectives for an architecture tradeoff.

## What it includes

- A Codex plugin manifest at `.codex-plugin/plugin.json`.
- A bundled MCP config at `.mcp.json`.
- A Codex skill at `skills/npcsmarket-companion/SKILL.md`.
- The npm CLI and MCP runtime published as `@npcsmarket/skill`.

## Codex beta install

### From this local checkout

Use this while developing or testing locally:

```bash
cd /Users/lyshen/Desktop/project/npcsmarket-skill
npm install
codex plugin marketplace add .
codex plugin add npcsmarket@npcsmarket-beta
codex plugin list
```

Then start a new Codex task and try:

```text
Use NPCsMarket. Pick 3 random NPCs, choose one, and ask it to advise me on whether to cut scope before launch.
```

Success means Codex can use the plugin, call `random_npc`, call `compose_prompt`, and return a useful persona-inspired answer.

### From GitHub after pushing this branch and publishing npm beta

```bash
codex plugin marketplace add Lyshen/npcsmarket-skill --ref codex/plugin-beta
codex plugin add npcsmarket@npcsmarket-beta
codex plugin list
```

Start a new Codex task after installing so Codex reloads the plugin, skill, and MCP tools. This path requires `@npcsmarket/skill@0.2.0-beta.0` to exist on npm because the GitHub plugin cache does not include `node_modules`.

## Available Codex MCP tools

- `random_npc`: returns 1 or 3 historical-mind candidates.
- `compose_prompt`: creates a prompt bundle for a chosen NPC, topic, and mode.

The public Codex MCP surface is read-only. Internal event tracking is not exposed as a Codex MCP tool.

## CLI usage

Install the npm package directly if you want the standalone CLI:

```bash
npm i -g @npcsmarket/skill
npc-skill random --count 3
```

```bash
npc-skill compose \
  --name "Sun Tzu" \
  --topic "Should we cut scope before launch?" \
  --mode advisor \
  --json
```

## MCP runtime

The plugin starts the MCP server through the local package:

```json
{
  "mcpServers": {
    "npcsmarket": {
      "cwd": ".",
      "command": "node",
      "args": ["./bin/npc-skill-mcp-bootstrap.js"]
    }
  }
}
```

The bootstrap runs the local MCP server when dependencies are present. For external installs without local dependencies, it falls back to `npx -y -p @npcsmarket/skill@0.2.0-beta.0 npc-skill-mcp`, so publish that npm beta before sharing the GitHub install command widely.

For manual MCP setup outside the plugin:

```bash
npm i -g @npcsmarket/skill
codex mcp add npcsmarket-skill -- npc-skill-mcp
codex mcp list
```

The plugin route is preferred for Codex distribution because users do not need to edit `~/.codex/config.toml` by hand.

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
npm pack --dry-run
```

Validate the Codex plugin shape:

```bash
python3 /Users/lyshen/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py .
```

## Release

For the Codex plugin beta, push the `codex/plugin-beta` branch and install from the GitHub marketplace command above.

Publishing is manual. Merging to `main` does not publish npm automatically.

Option A: publish from this machine after logging in to npm CLI:

```bash
npm login
npm whoami
npm test
npm publish --tag beta --access public
npm view @npcsmarket/skill@0.2.0-beta.0 version
```

Option B: publish from GitHub Actions:

1. Push this branch or merge it.
2. Open GitHub Actions.
3. Run the `Publish npm` workflow manually.
4. Choose the `beta` npm dist tag.

Use the `beta` dist tag until the Codex plugin package is ready to become the default `latest`. The plugin bootstrap falls back to `@npcsmarket/skill@0.2.0-beta.0`, so publish that package version before sharing the GitHub install command widely.

## Privacy

NPCsMarket sends the specific topic you provide to `https://npcsmarket.com` when composing a prompt bundle. Do not include secrets, full source files, credentials, or private customer data in the topic. The package may also create a local client id in `~/.npcsmarket-skill/config.json` for lightweight diagnostics and event calls. It does not upload repository files by default.
