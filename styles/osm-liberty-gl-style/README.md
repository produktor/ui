# OSM Liberty

GL basemap style based on [OSM Liberty](https://github.com/maputnik/osm-liberty), an open, minimal OSM style.

## Sources

| Source ID   | Type      | URL                                                                 | Description                          |
|-------------|-----------|---------------------------------------------------------------------|--------------------------------------|
| satellite-jaxa | raster  | [tiles.produktor.duckdns.org/services/jaxa_terrainrgb0-12](https://tiles.produktor.duckdns.org/services/jaxa_terrainrgb0-12) | JAXA terrain RGB (toggle in UI, off by default) |
| satellite-esri | raster  | [ESRI World Imagery](https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9) | ESRI satellite (toggle in UI, off by default) |
| openmaptiles| vector    | [tiles.produktor.duckdns.org/services/planet-231204.osm.renumbered](https://tiles.produktor.duckdns.org/services/planet-231204.osm.renumbered) | OSM vector tiles (OpenMapTiles schema) |
| hillshading | raster    | [tiles.produktor.duckdns.org/services/jaxa_hillshade](https://tiles.produktor.duckdns.org/services/jaxa_hillshade) | JAXA hillshade relief (z0–12)         |
| terrain-dem | raster-dem| [tiles.produktor.duckdns.org/services/jaxa_terrainrgb0-12](https://tiles.produktor.duckdns.org/services/jaxa_terrainrgb0-12) | JAXA AW3D30 Terrain-RGB for 3D terrain |

All tile sources are served from [tiles.produktor.duckdns.org/services](https://tiles.produktor.duckdns.org/services).

3D terrain is enabled in `app.js` via `map.setTerrain`. UI toggles: ESRI Satellite, Terrain RGB (jaxa), Hillshades.
