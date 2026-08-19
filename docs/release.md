# Release Guide

## One-time setup

1. Keep `@npcsmarket/skill` public on npm.
2. Configure npm Trusted Publisher for GitHub Actions:
   - package: `@npcsmarket/skill`
   - repository: `Lyshen/npcsmarket-skill`
   - workflow filename: `publish.yml`
   - allowed action: npm publish
3. Keep `publishConfig.access` set to `public` in `package.json`.

## Release

```bash
npm ci
npm test
gh workflow run publish.yml --ref main
```

Confirm package:

```bash
npm view @npcsmarket/skill version
npm view @npcsmarket/skill dist-tags --json
```
