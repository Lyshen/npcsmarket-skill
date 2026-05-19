# Release Guide

## One-time setup

1. Create npm package owner account and make sure package name is available:

```bash
npm view @npcsmarket/skill
```

2. In GitHub repo settings, add secret:
- `NPM_TOKEN`: npm automation token with publish permission.

3. Keep package as public in `package.json` and publish with `--access public`.

## Manual local release

```bash
npm ci
npm test
npm version patch
npm publish --access public
git push --follow-tags
```

## GitHub Actions release

1. Push code to `main`.
2. Open GitHub Actions.
3. Run workflow `Publish npm`.
4. Confirm package:

```bash
npm view @npcsmarket/skill version
```
