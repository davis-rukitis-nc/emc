# Data sources

| Website element | Source | Notes |
|---|---|---|
| 1991–2026 participant growth | `docs/registered-reach.csv` | Supplied RRM analysis file. The source column is internally named “registered”; the public visual uses “participants”. |
| 2026 countries and international reach | `docs/registered-reach.csv` | Supplied RRM analysis file. |
| 2026 distance finishers and shares | `docs/2026-distances.csv` | Supplied RRM analysis file. |
| Marathon / half-marathon international percentages | `docs/2026-distances.csv` | 58.7% and 35.6% respectively. |
| 2027 route | `docs/Rimi-Riga-Marathon-course-2027.gpx` | GPX route geometry. |
| Course landmarks | `docs/course-pois.kml` | Supplied clean KML; selected names, coordinates and descriptions are exported to `src/assets/data/pois.json`. |
| Elevation | `docs/elevation-reference.jpg` | Approximate visual reconstruction, scaled to the supplied 3.5 m minimum and 17 m maximum. Not surveyed data. |
| Sustainability scope split | `docs/sustainability-scopes-reference.png` | Supplied graphic: 342,354.1 kg; Scope 1 1%, Scope 2 1%, Scope 3 98%. |
| Sustainability programme wording | Official Rimi Riga Marathon sustainability page | `https://rimirigamarathon.com/en/sustainability/` |
| EMC city colours and dates | Supplied EMC HTML/code and logo SVG | Used across rings, calendar and Europe map. |

All final public claims should be checked by a named internal owner before launch.
