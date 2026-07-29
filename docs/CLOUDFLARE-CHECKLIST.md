# Cloudflare launch checklist

## GitHub

- [ ] Private repository created
- [ ] Project files are at repository root
- [ ] AllRoundGothic files added only if licensing permits
- [ ] `.dev.vars` is not tracked
- [ ] `main` contains the approved production build

## Cloudflare Worker

- [ ] Worker name is `emc-riga-proposal`
- [ ] Repository connected through Workers Builds
- [ ] Root directory is `/`
- [ ] Build command is `npm run build`
- [ ] Deploy command is `npx wrangler@latest deploy`
- [ ] Production branch is `main`

## Runtime secrets

- [ ] `SITE_PASSWORD` is set to `9THCLASSIC`
- [ ] `SESSION_SECRET` is a long random value
- [ ] Both are encrypted runtime secrets
- [ ] Neither appears in GitHub

## Domain

- [ ] `rimirigamarathon.com` is in the same Cloudflare account
- [ ] `emc.rimirigamarathon.com` custom domain is active
- [ ] TLS certificate is active

## Final test

- [ ] Logged-out visit displays the password gate
- [ ] Incorrect password remains blocked
- [ ] Correct password redirects to the proposal
- [ ] A new private/incognito session is blocked again
- [ ] Maps, video, fonts and physics render
- [ ] Mobile test completed
