---
name: "npcsmarket-companion"
description: "Use NPCsMarket in Codex when the user wants to think with historical-mind personas during coding, debugging, product, architecture, strategy, or agent wait time."
---

# NPCsMarket Companion

Use this skill when the user asks for NPCsMarket, historical thinkers, historical personas, a named figure from the NPCsMarket catalog, or a second perspective while Codex is working.

NPCsMarket is a Codex companion for lightweight thinking during coding wait time. It is useful for debugging, architecture tradeoffs, launch scope, product critique, competitive strategy, and reflection.

## Workflow

1. If the user names a figure, call `compose_prompt` with `npcName` or `npcSlug`.
2. If the user does not name a figure, call `random_npc` with `count: 3`, choose the best fit for the user's topic, then call `compose_prompt`.
3. Choose `advisor` mode for plans and tradeoffs, `debate` mode for challenging assumptions, and `socratic` mode for clarifying questions.
4. Use the returned prompt bundle to answer concisely in a persona-inspired perspective.
5. Keep the answer practical for a developer who may be waiting on tests, installs, builds, reviews, or another Codex task.

## Boundaries

- Do not present the persona as the real historical person.
- Do not use NPCsMarket for regulated medical, legal, or financial decisions.
- Do not send full source files or private secrets to the tool; summarize the specific question or tradeoff instead.
- If the user wants a normal coding answer without a persona, answer normally without invoking NPCsMarket.
