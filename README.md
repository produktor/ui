# Produktor UI

Map application built with Vue, Vuetify, and MapLibre GL.

## Keyboard Navigation

Game-style controls (disabled when typing in inputs):

| Key | Action |
|-----|--------|
| **W** | Zoom in |
| **S** | Zoom out |
| **A** | Slide right (pan east) |
| **D** | Slide left (pan west) |
| **F** | Invert bearing (+180°) |
| **↑** | Roll up (pitch) |
| **↓** | Roll down (pitch) |
| **←** | Roll left (bearing) |
| **→** | Roll right (bearing) |

## PWA

The app is installable as a Progressive Web App. Use **Add to Home Screen** in mobile browsers or install via Chrome's app menu on desktop. Uses `images/gis-icon.png` as the app icon.

## Map Toggles

- **ESRI Satellite** – ESRI imagery basemap (off by default)
- **Terrain RGB** – JAXA terrain basemap (off by default)
- **Hillshades** – JAXA hillshade relief (on by default)
- **OSM Vector** – OSM roads, labels, features (on by default)
- **Globe** – Globe projection with black sky (off by default)

See [styles/README.md](styles/README.md) for tile sources.
