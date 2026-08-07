# Cloudflare launch checklist

## GitHub

- [ ] Private repository created
- [ ] Project files are at repository root
- [ ] AllRoundGothic files added only if licensing permits
- [ ] `.dev.vars` is not tracked
- [ ] `main` contains the approved production build

## Cloudflare Pages

- [ ] Pages project name is `emc-riga-proposal`
- [ ] Repository connected through Pages
- [ ] Root directory is `/`
- [ ] Framework preset is `None`
- [ ] Build command is `npm run pages:build`
- [ ] Build output directory is `dist`
- [ ] Production branch is `main`

## Runtime secrets

- [ ] `SITE_PASSWORD` is set to `9THCLASSIC`
- [ ] `SESSION_SECRET` is a long random value
- [ ] Both are encrypted runtime secrets
- [ ] Neither appears in GitHub

## Domain

- [ ] `emc.rimirigamarathon.com` is added in Pages Custom domains
- [ ] External DNS has the CNAME value supplied by Pages
- [ ] `emc.rimirigamarathon.com` custom domain is active
- [ ] TLS certificate is active

## Final test

- [ ] Logged-out visit displays the password gate
- [ ] Incorrect password remains blocked
- [ ] Correct password redirects to the proposal
- [ ] A new private/incognito session is blocked again
- [ ] Maps, video, fonts and physics render
- [ ] Mobile test completed
