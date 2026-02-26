# MapTiler Terrain
[![Build Status](https://travis-ci.org/openmaptiles/klokantech-terrain-gl-style.svg?branch=master)](https://travis-ci.org/openmaptiles/klokantech-terrain-gl-style)

A GL basemap style using the vector tile schema of [OpenMapTiles](https://github.com/openmaptiles/openmaptiles) as well as contour lines and hillshading from [maptiler.com](https://maptiler.com).

![MapTiler Terrain](https://openmaptiles.org/img/styles/terrain.jpg)

## Sources

| Source ID   | Type   | URL / provider                                | Description              |
|-------------|--------|-----------------------------------------------|--------------------------|
| openmaptiles| vector | MapTiler API (`api.maptiler.com`)             | OpenMapTiles vector base |
| hillshading | raster | Klokantech TileHosting                        | Hillshade relief (z0–12)  |
| contours    | vector | Klokantech TileHosting                        | Contour lines with labels|
