# Map Styles

GL styles for Mapbox GL / MapLibre GL.

## Tile Services

Base URL: [https://tiles.produktor.duckdns.org/services](https://tiles.produktor.duckdns.org/services)

| Service                               | Type   | Format | Description                     |
|---------------------------------------|--------|--------|---------------------------------|
| planet-231204.osm.renumbered          | vector | PBF    | OSM vector tiles (eSlider maps)  |
| jaxa_hillshade                        | raster | PNG    | JAXA hillshade relief (z0–12)   |
| jaxa_terrainrgb_0-12                  | raster | PNG    | JAXA terrain RGB                 |
| dtm_canopy.height_glad.umd_m_30m...   | raster | PNG    | Canopy height (EUMAP EPSG:3035)  |

Each service exposes TileJSON at its base URL; raster tiles use `{z}/{x}/{y}.png`.

## Style Directories

| Style                | Sources                                      |
|----------------------|----------------------------------------------|
| [osm-liberty-gl-style](osm-liberty-gl-style/) | produktor vector + hillshade                  |
| [maptiler-terrain-gl-style](maptiler-terrain-gl-style/) | MapTiler / Klokantech (external)              |
