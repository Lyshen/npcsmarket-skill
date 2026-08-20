# NPCsMarket Codex Plugin

[English](#english) | [中文](#中文)

<a id="english"></a>
## English

NPCsMarket brings historical personas and practical thinking modes into Codex. Use it to discuss product positioning, design critique, competitive strategy, marketing narrative, systems leverage, debugging, and architecture through a figure's reasoning pattern and first-person voice.

## Install

```bash
codex plugin marketplace add Lyshen/npcsmarket-skill --ref main
codex plugin add npcsmarket@npcsmarket
```

Start a new Codex task after installing so the plugin, skill, and MCP tools are loaded.

## Try It

Copy one of these into Codex:

```text
Use NPCsMarket. Pick 3 random NPCs for my product positioning, choose one, and answer through that figure's reasoning pattern and first-person voice.

Use NPCsMarket. Pick 3 random NPCs for this launch plan, choose one, and debate me through that figure's historical frame.

Use NPCsMarket. Ask Peter Drucker to audit our ICP, pricing, and first sales motion.

Use NPCsMarket. Ask Sun Tzu to find our competitive wedge before launch.

Use NPCsMarket. Ask Donella Meadows to find leverage points in our activation funnel.

Use NPCsMarket. Ask Marcel Duchamp to reframe our landing page and category story.

Use NPCsMarket. Ask Edward Said to critique the market narrative we inherited.

Use NPCsMarket. Ask Socrates to turn this roadmap into uncomfortable product-discovery questions.

Use NPCsMarket. Ask Alan Turing to reason about edge cases in this agent workflow.
```

## What It Adds

- `random_npc`: get 1 or 3 historical persona candidates.
- `compose_prompt`: build a focused persona prompt for a topic and mode.
- `create_share`: publish a short user-approved excerpt as a public share page.
- `send_feedback`: report a simple user-approved good, bad, or other experience signal.
- `npcsmarket-companion`: a Codex skill that decides when to use the NPCsMarket tools.

The persona tools are read-only. `create_share` only runs after explicit approval and publishes the excerpt you provide.

## CLI

```bash
npm i -g @npcsmarket/skill@latest
npc-skill random --count 3
```

```bash
npc-skill compose \
  --name "Donella Meadows" \
  --topic "Find leverage points in our activation funnel" \
  --mode advisor
```

```bash
npc-skill share \
  --name "Donella Meadows" \
  --slug meadows \
  --topic "Writing as a thinking channel" \
  --title "Writing as context reconstruction" \
  --excerpt "A short excerpt the user explicitly approved for public sharing." \
  --consent
```

Sharing is opt-in. Only the excerpt you pass to `--excerpt` is sent for the public share page.

```bash
npc-skill feedback --sentiment good --slug meadows --note "The persona stayed in voice."
```

If you want NPCsMarket to contact you about a feedback report, add
`--contact-email you@example.com`. Contact email is optional and only used for admin follow-up.

## Privacy

NPCsMarket sends the topic you provide to `https://npcsmarket.com` when composing a prompt bundle. Sharing sends only the excerpt you approve. Feedback sends the sentiment, optional note, and optional contact email only when you provide one for follow-up. Do not include secrets, full source files, credentials, or private customer data. The package may create a local client id in `~/.npcsmarket-skill/config.json` for lightweight diagnostics.

<a id="中文"></a>
## 中文

NPCsMarket 是一个 Codex 插件，让你在 Codex 跑测试、安装依赖、构建、审查或执行 agent 任务时，用不同历史人物的思维模式和第一人称口吻讨论产品、设计、竞争、营销、系统杠杆、调试和架构问题。

## 安装

```bash
codex plugin marketplace add Lyshen/npcsmarket-skill --ref main
codex plugin add npcsmarket@npcsmarket
```

安装后新开一个 Codex 任务，让插件、skill 和 MCP 工具重新加载。

## 试用

```text
使用 NPCsMarket。随机选 3 个 NPC 来分析我的产品定位，选一个，并用这个人物的思维方式和第一人称口吻回答我。

使用 NPCsMarket。随机选 3 个 NPC 来评估这个发布计划，选一个，并用这个人物的历史分析框架和我辩论。

使用 NPCsMarket。请 Peter Drucker 审视我们的 ICP、定价和第一阶段销售动作。

使用 NPCsMarket。请 Sun Tzu 帮我找到发布前的竞争切入点。

使用 NPCsMarket。请 Donella Meadows 找出激活漏斗里的系统杠杆点。

使用 NPCsMarket。请 Marcel Duchamp 重新定义我们的落地页和品类故事。

使用 NPCsMarket。请 Edward Said 批判我们继承的市场叙事。

使用 NPCsMarket。请 Socrates 把这份路线图变成尖锐的产品发现问题。

使用 NPCsMarket。请 Alan Turing 分析这个 agent workflow 里的边界情况。
```

## 包含内容

- `random_npc`：随机获取 1 个或 3 个历史人物视角。
- `compose_prompt`：为指定话题和人物生成可执行的思考 prompt。
- `create_share`：把用户明确同意的短摘录发布成公开分享页。
- `send_feedback`：上报用户明确给出的 good、bad 或 other 体验反馈。
- `npcsmarket-companion`：帮助 Codex 判断什么时候调用 NPCsMarket。

人物工具是只读的，不会修改你的项目。`create_share` 只有在明确确认后才会发布你提供的摘录。

## 隐私

NPCsMarket 在生成 prompt bundle 时会把你输入的话题发送到 `https://npcsmarket.com`。不要输入密钥、完整源码、凭据或客户隐私数据。这个包可能会在本地 `~/.npcsmarket-skill/config.json` 创建一个 client id，用于轻量诊断。

分享功能需要显式确认。只有你传给 `--excerpt` 的内容会用于公开分享页。
反馈可以选择留下联系邮箱，用于 admin 后续联系了解问题；不填则不会发送。
