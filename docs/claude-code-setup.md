# Claude Code Setup

This guide enables `@npcsmarket/skill` as a local MCP server in Claude Code.

## 1) Install package

```bash
npm i -g @npcsmarket/skill@latest
```

## 2) Register MCP server

```bash
claude mcp add --scope user npcsmarket-skill -- npc-skill-mcp
```

If command resolution fails, use absolute path:

```bash
claude mcp add --scope user npcsmarket-skill -- ~/.petclaw/node/bin/npc-skill-mcp
```

## 3) Verify

```bash
claude mcp list
```

Expected output includes:

- `npcsmarket-skill`
- status connected / healthy

## 4) Chat smoke prompts

Use these in Claude Code chat:

1. `Use random_npc and return 3 candidates.`
2. `Pick Sun Tzu and call compose_prompt with topic "US-Iran escalation risk" in advisor mode.`
3. `Call track_event with eventName "skill_compose" and npcSlug "sun-tzu".`

## 5) Remove (optional)

```bash
claude mcp remove npcsmarket-skill
```
