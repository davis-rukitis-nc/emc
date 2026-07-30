# EMC Riga Proposal

Production-ready, password-protected one-page proposal for:

**https://emc.rimirigamarathon.com**

The project is designed for **GitHub → Cloudflare Workers Builds**. It combines a static site with a Cloudflare Worker that protects every page and asset behind a signed session cookie.

## Project status

Version: **1.0.0 production candidate**

Production password to configure as a Cloudflare secret:

```text
9THCLASSIC
```

Do not commit the password or session secret to GitHub.

## Local preview

1. Place the licensed AllRoundGothic files in Downloads, Desktop or beside this project:
   - `AllRoundGothic-Book.ttf`
   - `AllRoundGothic-Demi.ttf`
   - `AllRoundGothic-Bold.ttf`
2. Double-click `START-LOCAL.command`.
3. Open `http://localhost:4173`.
4. Enter `9THCLASSIC`.

Alternatively:

```bash
npm run dev
```

The local preview uses `.dev.vars`. This file is ignored by Git and is intentionally not included in the production package. Create it from the example when needed:

```bash
cp .dev.vars.example .dev.vars
```

## Required font step before GitHub upload

The font files are not included in this archive. Copy your licensed files into:

```text
src/assets/fonts/
```

Confirm the folder contains:

```text
src/assets/fonts/AllRoundGothic-Book.ttf
src/assets/fonts/AllRoundGothic-Demi.ttf
src/assets/fonts/AllRoundGothic-Bold.ttf
```

The `.gitignore` currently excludes font files. Remove the four font exclusion lines only when your licence permits committing these fonts to a private repository. Otherwise, add them during the Cloudflare build through another private asset workflow.

## Commands

```bash
npm run dev       # protected local preview using src/
npm run validate  # structural and JavaScript checks
npm run build     # generate dist/
npm run preview   # protected local preview using dist/
npm run cf:dev    # build and preview through Wrangler
npm run deploy    # build and deploy through Wrangler
```

## Recommended GitHub setup

Create a **private** GitHub repository named:

```text
emc-riga-proposal
```

Upload the contents of this folder to the repository root, not the outer ZIP folder.

Terminal method:

```bash
git init
git branch -M main
git add .
git commit -m "Initial production release"
git remote add origin git@github.com:YOUR-ACCOUNT/emc-riga-proposal.git
git push -u origin main
```

Before committing, check that neither `.dev.vars` nor any unintended secret file appears in:

```bash
git status
```

## Cloudflare Workers Builds setup

Use **Workers**, not a Pages project.

1. Open Cloudflare → **Workers & Pages**.
2. Select **Create application**.
3. Choose **Import a repository**.
4. Connect GitHub and select the private repository.
5. Set the Worker/project name to exactly:

```text
emc-riga-proposal
```

6. Use these build settings:

```text
Production branch: main
Root directory: /
Build command: npm run build
Deploy command: npx wrangler@latest deploy
```

7. Save and deploy.

The Worker name must match the `name` in `wrangler.jsonc`.

## Runtime secrets

After the Worker exists, open:

**Worker → Settings → Variables & Secrets**

Add these as encrypted **runtime secrets**, not build variables:

```text
SITE_PASSWORD = 9THCLASSIC
SESSION_SECRET = a long random value
```

Generate the session secret on macOS with:

```bash
openssl rand -base64 48
```

Redeploy or retry the latest deployment after adding the secrets.

## Custom domain

`wrangler.jsonc` already defines this Cloudflare Custom Domain:

```text
emc.rimirigamarathon.com
```

Cloudflare should create and manage the required DNS and certificate when deploying, provided `rimirigamarathon.com` is in the same Cloudflare account.

## Preview branches

In the Worker’s **Settings → Builds → Branch control**, enable builds for non-production branches when review links are useful.

Recommended workflow:

```text
main       → live production
feature/*  → Cloudflare preview versions
```

## Main files

```text
src/index.html             page structure and content
src/styles.css             complete visual system
src/app.js                 charts, maps, Matter.js and interactions
worker/index.js            password protection and security headers
wrangler.jsonc             Cloudflare Worker/assets/custom-domain config
src/assets/data/           course, cities and chart data
src/assets/images/         production imagery
src/assets/brand/          logo and identity SVGs
```

## Pre-deployment checks

Run:

```bash
npm run validate
npm run build
npm run preview
```

Verify:

- password gate opens with `9THCLASSIC`;
- map tiles load with an internet connection;
- Matter.js elements remain active and draggable;
- the course route and landmarks render;
- YouTube privacy-enhanced embed loads;
- desktop and mobile layouts have no clipping;
- `.dev.vars` is not committed.

## Manual Wrangler deployment

GitHub integration is recommended, but direct deployment also works:

```bash
npx wrangler@latest login
npm run build
npx wrangler@latest deploy
npx wrangler@latest secret put SITE_PASSWORD
npx wrangler@latest secret put SESSION_SECRET
```

Enter `9THCLASSIC` for `SITE_PASSWORD` and a generated random value for `SESSION_SECRET`.

## Version 1.1 UX review update

- Course module rebuilt around an always-visible rotating POI panel and a closer route map.
- Existing landmark entries now support `image`; three new kilometre points were added: KM 11, KM 18 and KM 35.
- Replace `/src/assets/images/landmarks/poi-placeholder.svg` or set individual `image` values in `src/assets/data/pois.json` as approved images arrive.
- Added Rimi Riga Marathon favicon and social-description tags.
- Physics canvas keeps pointer dragging while allowing wheel/trackpad page scrolling.
- Added 2020 and 2021 pandemic annotations to the historical participation chart.
- Updated medal, sustainability, Kids’ Day, operational pillars and marathon-growth visuals.
- Cloudflare configuration remains on the protected `emc.necom.workers.dev` preview route. Runtime secrets must exist under Worker Settings → Variables and Secrets.
