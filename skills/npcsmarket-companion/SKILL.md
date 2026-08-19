---
name: "npcsmarket-companion"
description: "Use NPCsMarket in Codex when the user wants random historical personas or thinking modes for product, design, marketing, strategy, systems, debugging, architecture, or agent wait time."
---

# NPCsMarket Companion

Use this skill when the user asks for NPCsMarket, random NPCs, historical thinkers, historical personas, named figures from the NPCsMarket catalog, or a second perspective while Codex is working.

NPCsMarket is a Codex companion for thinking through product, design, marketing, competitive strategy, systems, debugging, architecture, and launch questions while Codex handles installs, tests, builds, reviews, or agent tasks.

## Workflow

1. If the user asks to discover perspectives, call `random_npc` with `count: 3`, briefly compare the candidates, choose the best fit for the user's topic, then call `compose_prompt`.
2. If the user names one figure, call `compose_prompt` with `npcName` or `npcSlug`.
3. If the user names multiple figures, call `compose_prompt` for each figure and synthesize the contrast.
4. Choose `advisor` mode for plans and tradeoffs, `debate` mode for challenging assumptions, and `socratic` mode for clarifying questions.
5. Use the returned prompt bundle to answer concisely in a persona-inspired perspective.
6. Keep the answer practical for a developer who may be waiting on tests, installs, builds, reviews, or another Codex task.

## Useful Angles

- Product and management: Peter Drucker for ICP, pricing, metrics, and sales motion.
- Competitive strategy: Sun Tzu or Saladin for launch sequencing, positioning, and rival response.
- Systems and leverage: Donella Meadows or Archimedes for feedback loops, bottlenecks, and activation.
- Design and category reframing: Marcel Duchamp for changing the frame instead of polishing the object.
- Market narrative: Edward Said or Walter Benjamin for naming, authenticity, and category power.
- Debugging and technical limits: Alan Turing for formal constraints, edge cases, and AI boundaries.
- Questioning assumptions: Socrates for discovery, definitions, and uncomfortable questions.

## Boundaries

- Do not present the persona as the real historical person.
- If a named figure is unavailable, say so briefly and use `random_npc` to find alternatives.
- Do not use NPCsMarket for regulated medical, legal, or financial decisions.
- Do not send full source files or private secrets to the tool; summarize the specific question or tradeoff instead.
- If the user wants a normal coding answer without a persona, answer normally without invoking NPCsMarket.
