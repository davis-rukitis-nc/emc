# Codex instructions

## Project purpose

This is a password-protected, one-off Rimi Riga Marathon proposal to European Marathon Classics. It is not a registration site and is not expected to become a general CMS product.

## Non-negotiable rules

- Use British English.
- Preserve the existing proposal section order and argument structure.
- Do not materially rewrite approved proposal copy unless explicitly requested.
- Do not add internal process notes, data-source explanations, colour codes, implementation notes or placeholder-status wording to the visible page.
- Never invent data, sources, athlete results, financial figures, dates, rankings or images.
- Missing photography must use the existing `.photo-slot` treatment or the existing project placeholder system.
- Keep the proposal context clear without claiming that Riga has already joined European Marathon Classics.
- Keep the site password protected. Do not move `SITE_PASSWORD` or `SESSION_SECRET` into client-side JavaScript, source files or committed configuration.
- Do not commit `.dev.vars`, production secrets, access tokens or Cloudflare credentials.
- Do not add a `/print` page unless explicitly approved later.
- Do not add Payload or another CMS without a new architecture decision.
- Do not replace the GPX-derived course with an inaccurate hand-drawn route.
- Do not add, copy, export or redistribute licensed font files outside the existing repository. Do not remove or rename the existing project font files unless explicitly instructed.
- Preserve `prefers-reduced-motion` support and keyboard usability.
- Keep only one simultaneously visible navigation system.
- Do not deploy directly to Cloudflare or change Cloudflare settings unless explicitly requested. Normal work should be delivered as reviewed GitHub changes.
- Do not change approved logos, medal SVG artwork or other supplied brand assets unless explicitly instructed.
- Preserve image credits, captions and factual distinctions such as current versus former world records.

## Technical approach

- Static files live in `src/`.
- Local authentication is handled by `scripts/dev-server.mjs`.
- Cloudflare authentication is handled by `worker/index.js`.
- Build output is written to `dist/`.
- There are no runtime package dependencies unless the repository is intentionally updated to add them.
- Visualisations and overlays are implemented locally with SVG, CSS and JavaScript.
- CARTO raster tiles are used for map backgrounds; Mapbox remains optional.
- Course geometry must continue to come from the supplied GPX/GeoJSON data.
- POI and chart data should be edited in the existing JSON data files rather than hard-coded into presentation markup where practical.
- Keep the current GitHub-to-Cloudflare deployment structure intact unless an architecture change is explicitly approved.

## Editing rules

- Read the relevant HTML, CSS, JavaScript and data files before changing a section.
- Prefer the smallest change that solves the stated problem.
- Do not redesign unrelated sections during a targeted fix.
- Preserve existing class names and data structures unless changing them is necessary.
- Keep responsive behaviour consistent across desktop, tablet and mobile.
- Avoid adding visible technical copy, development labels or explanatory text that was not requested.
- When updating charts, reuse the existing distance colours and visual tokens consistently.
- When adding POIs, support the existing fields such as title/name, latitude, longitude, description and image.
- Use accessible labels for interactive controls and preserve visible focus states.
- Avoid scroll hijacking and ensure wheel or trackpad scrolling continues to work over interactive canvases and maps.

## Verification before proposing a change

Run:

```bash
npm run validate
npm run build
```

For visual changes, also:

1. Start the local preview with `npm run dev`.
2. Test the password flow using the local development password.
3. Review the affected section at approximately 1440 px, 768 px and 390 px widths.
4. Check for clipping, overflow, layout shifts, overlapping labels, broken maps, inaccessible controls and reduced-motion behaviour.
5. Confirm that no unrelated files or approved copy were changed.

## Expected task output

When completing a task:

- Summarise only the files and behaviour actually changed.
- State which verification commands were run and whether they passed.
- Flag any missing asset, unsupported claim or unresolved visual issue instead of guessing.
- Do not claim a deployment succeeded unless the deployment was actually run and verified.
