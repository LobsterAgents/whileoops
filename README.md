# whileoops.com

A small Astro site for collecting AI agent oops, automation faceplants, token bonfires, and loops that should have stopped sooner.

## Local Development

```sh
npm install
npm run dev
```

## Submit Flow

The site uses a GitHub Issue Form:

- Visitors click "Submit a #fail"
- GitHub opens `.github/ISSUE_TEMPLATE/submit-fail.yml`
- New submissions receive `submission` and `needs-review`
- Maintainers review and redact if needed
- Approved submissions can be copied into site data or later pulled from GitHub by label

Before launch, update `src/data/site.ts`:

```ts
submitUrl: 'https://github.com/LobsterAgents/whileoops.com/issues/new?template=submit-fail.yml',
repoUrl: 'https://github.com/LobsterAgents/whileoops.com',
```

## Deploy

Netlify is configured with `netlify.toml`.

```sh
npm run build
```
