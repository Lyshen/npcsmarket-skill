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
