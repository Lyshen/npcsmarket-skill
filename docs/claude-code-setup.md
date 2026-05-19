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

## 3) Verify

```bash
claude mcp list
```

Expected output includes:

- `npcsmarket-skill`
- status connected / healthy

## 4) Chat smoke prompts

Use this in Claude Code chat:

`Call random_npc with count 3, pick one candidate automatically, then call compose_prompt in debate mode using topic: "If AI skills are free, where does value concentrate and who captures it over time?" Finally call track_event with eventName "skill_compose".`

## 5) Remove (optional)

```bash
claude mcp remove npcsmarket-skill
```
