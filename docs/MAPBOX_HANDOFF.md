# Optional Mapbox handoff

Mapbox is not required for the current revision. The site now displays:

- CARTO dark raster tiles for geographic context
- GPX-derived local SVG course geometry
- KML-derived local landmark markers and descriptions
- Local EMC city markers and the Copenhagen–Riga connection

This allows review without a Mapbox account. An internet connection is still required for the raster tile background.

A later Mapbox upgrade would require:

- A public Mapbox token restricted to `emc.rimirigamarathon.com` and approved preview domains
- A custom style ID
- A decision on street-label density and optional 3D buildings
- Retention of a non-WebGL fallback using the current route and marker data

Recommended visual treatment:

- Land: near black
- Water: `#00609C`
- Course: `#40B07A`
- Start/finish: concentric-ring markers
- Low-density labels only
- Route drawing animation after the map enters the viewport

Never expose a secret Mapbox management token. Browser Mapbox tokens are public by design and should be URL-restricted.
