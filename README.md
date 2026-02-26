# Produktor UI

Map application built with Vue, Vuetify, and MapLibre GL.

## Keyboard Navigation

Game-style controls (disabled when typing in inputs):

| Key Combo | Action                          |
| --------- | ------------------------------- |
| **W + ↑** | Fly forward (shooter-style)     |
| **S + ↓** | Fly backward (shooter-style)    |
| **A**     | Slide left (pan west)           |
| **D**     | Slide right (pan east)          |

Keyboard zoom and keyboard rotation are disabled. Mouse interactions remain unchanged.
Forward/back movement is combo-only: hold both keys together (`W` + `ArrowUp`, `S` + `ArrowDown`).

## PWA

The app is installable as a Progressive Web App. Use **Add to Home Screen** in mobile browsers or install via Chrome's app menu on desktop. Uses `images/gis-icon.png` as the app icon.

## Map Toggles

- **ESRI Satellite** - ESRI imagery basemap (off by default)
- **Terrain RGB** - JAXA terrain basemap (off by default)
- **Hillshades** - JAXA hillshade relief (on by default)
- **OSM Vector** - OSM roads, labels, features (on by default)
- **Globe** - Globe projection with black sky (off by default)

See [styles/README.md](styles/README.md) for tile sources.
