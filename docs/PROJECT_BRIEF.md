# Project brief

## Objective
Present the Rimi Riga Marathon as the missing Baltic anchor and a credible proposed ninth member of European Marathon Classics.

## Audience
European Marathon Classics board members, race leadership and invited decision-makers.

## Format
A private, password-protected, animated one-page website at `emc.rimirigamarathon.com`.

## Narrative order
1. Completing the Circle hero
2. Aigars Nords letter
3. Riga Mayor endorsement
4. Seven reasons, in the supplied order
5. Concrete €50,000 offer
6. Team and closing statement

## Visual direction
- Black-led European Marathon Classics aesthetic
- Proposed Riga ring: `#40B07A`
- Remaining future ring: `#00609C`
- Editorial scale and spacing rather than a dashboard/card-heavy interface
- Motion used for rings, charts, course drawing and reveals
- No scroll hijacking
- Empty placeholders for missing photography

## Core technical decisions
- Lightweight static implementation rather than Astro/Payload because the project is a one-off and content updates are expected to be small.
- GitHub as the versioned content backbone.
- Cloudflare Worker in front of all assets for password protection.
- Custom SVG route for the first prototype; Mapbox can be added later without blocking the build.
