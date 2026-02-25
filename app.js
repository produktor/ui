"use strict";

document.onreadystatechange = async () => { if(document.readyState !==
  "complete") { return; }

  let vue, map; let layerName = 'immo'; let popup; let poiPopup;

  // Import components (await
  // import('./components/button-counter.js')).default(); Vue.config.silent =
  // false;

  let menuItems = [

    { icon:       'mdi-chevron-up', 'icon-alt': 'mdi-chevron-down', text:
      'Products',
      children:   [
        {
          icon: 'mdi-arrow-down-bold-box',
          text: 'Find a product',
          id:   'product-search'
        }, {
          icon: 'mdi-arrow-up-bold-box',
          text: 'Give away',
          id:   'product-serve'
        }
      ],
    },
    {//                 <v-icon>mdi-map</v-icon>
      icon:       'mdi-chevron-up',
      'icon-alt': 'mdi-chevron-down',
      text:       'Service',
      onDebug:    true,
      children:   [

        {
          icon: 'mdi-arrow-down-bold-box-outline',
          text: 'Find a service',
          id:   'service-receive'
        },
        {
          icon: 'mdi-arrow-up-bold-box-outline',
          text: 'Provide a service',
          id:   'service-serve'
        }
      ],
    },
    {
      icon:       'mdi-chevron-dio',
      'icon-alt': 'mdi-chevron-down',
      text:       'Project',
      children:   [
        // {
        //   icon: 'mdi-head-question-outline',
        //   text: 'FAQ',
        //   id:   'info-questions'
        // },
        {
          icon: 'mdi-book-open-variant',
          text: 'Terms of use',
          id:   'info-terms'
        },
        {
          icon: 'mdi-information',
          text: 'About',
          id:   'info-project'
        },
        {
          icon: 'mdi-copyright',
          text: 'License',
          id:   'info-license'
        }
      ]
    },

  ];

  // Preload utils & libraries
  const app = window.app = {
    geo:  await import('./components/geo.js?v=' + Math.random()),
    net:  await import('./components/net.js?v=' + Math.random()),
    html: await import('./components/html.js?v=' + Math.random())
  };

  // Preload components
  async function loadItems(items) {
    for (const item of items) {
      if(item.children && item.children.length) {
        await loadItems(item.children);
      }
      if(!item.id) continue;
      if(item.id in Vue.options.components) continue;

      let path = item.id.replace("-", "/");
      await import('./components/' + path + '.js?v=' + Math.random());
    }
  }

  await loadItems(menuItems);

  app.vue = vue = new Vue({
    el:      '#app',
    vuetify: new Vuetify({
      theme: {
        dark: true
      }
    }),

    props: {
      source: String,
      // model:  'Postal search'
    },

    data: () => ({

      versions: null,

      /**  Last JSON API result */
      lastResult: null,

      /**  Snack bar control values */
      snackbar:      false,
      snackbarText:  null,
      snackbarError: "",

      /**  Geo types. Used for service requests */
      types: {
        shape: [
          "Any",
          "Point",
          "Line",
          "Polygon"
        ],
        admin: {
          DE: [
            {id: 8, name: "Land"},
            {id: 7, name: "Bundesland"},
            {id: 1, name: "Regierungsbezirk"},
            {id: 2, name: "Landkreis"},
            {id: 4, name: "Kreisfreie Stadt"},
            {id: 3, name: "Gemeindeverband"},
            {id: 5, name: "Stadt"},
            {id: 6, name: "Gemeinde"},
            {id: 9, name: "Stadtteil"},
            {id: 10, name: "Ortsteil"}
          ],
          AT: [
            {id: 8, name: "Land"},
            {id: 7, name: "Bundesland"},
            {id: 1, name: "Regierungsbezirk"},
            {id: 2, name: "Landkreis"},
            {id: 4, name: "Kreisfreie Stadt"},
            {id: 3, name: "Gemeindeverband"},
            {id: 5, name: "Stadt"},
            {id: 6, name: "Gemeinde"},
            {id: 9, name: "Stadtteil"},
            {id: 10, name: "Ortsteil"}
          ],
          CH: [
            {id: 8, name: "Land"},
            {id: 1, name: "Kantonen"},
          ]
        },
        // Wonach wir suchen
        // LocationTypeId
        location: [
          {id: 0, name: "Any"},
          // {id: 2, name: "Land"},
          // {id: 4, name: "Bundesland"},
          // {id: 5, name: "Regierungsbezirk"},
          // {id: 6, name: "Landkreis / Kreis / kreisfreie Stadt / Stadtkreis"},
          // {id: 7, name: "Amtsgemeinde, Verwaltungsgemeinschaft"},
          {id: 8, name: "Stadt, Gemeinde"},
          // {id: 9, name: "Stadtbezirk / Gemeindeteil (mit Selbstverwaltung)"},
          {id: 10, name: "Stadtteil / Gemeindeteil (ohne Selbstverwaltung)"},
          // {id: 11, name: "Stadtviertel"},
          // {id: 21, name: "Ferienregion"},
          // {id: 22, name: "Ferienregion"},
          // {id: 100, name: "PLZ-Land"},
          // {id: 101, name: "Postleitzone"},
          // {id: 102, name: "Postleitzahlenbereich"}
        ],
        geo:      [
          'Location',
          'AdminRegion',
          // 'FewoRegion',
          // 'MetropolitanRegion',
          // 'Island',
          'PostCodeRegion',
          // 'City',
          // 'Island',
          // 'Street',
          // 'Housenumber'
        ]
      },

      lastError: null,

      state: null,

      colors: {
        immo: {
          yellow: '#fbb900',
          black:  '#343433'
        }
      },

      alert: true,

      // Feature to display in property window
      currentFeature: null,

      // Countries
      countries: [
        {id: 'ES', label: 'Spain'},
        {id: 'DE', label: 'Germany'},
      ],

      // Current country in
      country: null,

      // Displaying navigation?
      drawer: null,

      // Current service stage
      stage: 'Dev',

      // Possible stages
      stages: ['Dev', 'Preview', 'Live', 'Local'],

      // Current module frame
      currentFrame: null,

      // Menu items
      items: menuItems,
    }),

    created() {
      this.state = localStorage.immoMapState ? JSON.parse(localStorage.immoMapState) : {theme: 'dark'};
      this.state.esriSatellite = this.state.esriSatellite ?? false;
      this.state.jaxaTerrainRgb = this.state.jaxaTerrainRgb ?? false;
      this.state.hillshades = this.state.hillshades ?? true;
      this.state.osmVector = this.state.osmVector ?? true;
      this.state.globe = this.state.globe ?? false;
      this.state.buildings3d = this.state.buildings3d ?? true;
    },

    methods: {

      /**
       * Search subject
       *
       * @param {function} onFeature
       * @param {string|RegExp} subject
       */
      search(subject, onFeature) {
        let feature;
        app.net.request(`nominatim.search.json?search${subject}`, fetcher => {
          fetcher.then(response => {

            if(!response || !response.result)
              return;

            let result = response.result;
            let wktReader = new Wkt.Wkt(result.wktGeometry);
            // Remove WKT Geometry. Is to big...
            delete result.wktGeometry;
            feature = {
              type:       "Feature",
              id:         app.geo.utils.genUUID(),
              geometry:   wktReader.toJson(),
              properties: result
            };

          }).finally(() =>
            onFeature(feature)
          );
        });
      },

      /**
       * Get location by ID
       *
       * @param {int} id
       * @param {function} onFeature
       */
      getLocation(id, onFeature) {
        let wktReader = new Wkt.Wkt(result.wktGeometry);
        onFeature(feature = {
          type:       "Feature",
          id:         app.geo.utils.genUUID(),
          geometry:   wktReader.toJson(),
          properties: {
            id: id
          }
        });
        return;
        let feature;
        app.net.request(`api.php?act=location&stage=${this.stage}&id=${id}`, fetcher => {
          fetcher.then(response => {

            if(!response || !response.result)
              return;

            let result = response.result;

            // const coordinates = new LngLat(response.longitude, response.latitude);
            let wktReader = new Wkt.Wkt(result.wktGeometry);
            // Remove WKT Geometry. Is to big...
            delete result.wktGeometry;
            feature = {
              type:       "Feature",
              id:         app.geo.utils.genUUID(),
              geometry:   wktReader.toJson(),
              properties: result
            };

          }).finally(() =>
            onFeature(feature)
          );
        });
      },

      /**
       * Get location ID by immowelt Geo ID
       *
       * @param {int} immoweltGeoId
       * @param {function} onResult
       */
      getLocationIdByImmoweltGeoId(immoweltGeoId, onResult) {
        let result;

        app.net.request(`api.php?act=locationidbyimmoweltgeoid&stage=${this.stage}&id=${immoweltGeoId}`, fetcher => {
          fetcher.then(response => {

            result = response.result;

            if(!response || !response.result)
              return;

          }).finally(() =>
            onResult(result.locationId)
          );
        });
      },

      /**
       * Get location ID by immowelt Geo ID
       *
       * @param {int} immonetGeoId
       * @param {string} immonetGeoLevel
       * @param {function} onResult
       */
      getLocationIdByImmonetGeoId(immonetGeoId, immonetGeoLevel, onResult) {
        let result;

        app.net.request(`api.php?act=locationidbyimmonetgeoinfo&stage=${this.stage}&id=${immonetGeoId}&immonetGeoLevel=${immonetGeoLevel}`, fetcher => {
          fetcher.then(response => {

            result = response.result;

            if(!response || !response.result)
              return;

          }).finally(() =>
            onResult(result.locationId)
          );
        });
      },

      // Get update version info
      updateInfo() {
        this.versions = {
          "uiVersion": "0.1.12b",
          "map":       "Canary 2021.12"
        };
      },

      // Copy versions to clipboard
      copyVersionsToClipboard() {
        /* Get the text field */
        const r = document.createRange();
        r.selectNode(document.getElementById("versionBlock"));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(r);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
      },
      // copy curl command to clipboard
      copyCurlCommandToClipboard() {
        const r = document.createRange();
        r.selectNode(document.getElementById("curlCommand"));
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(r);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();
      },

      saveState(key, value) {
        if(!localStorage.immoMapState) {
          localStorage.immoMapState = "{}";
        }
        const val = JSON.parse(localStorage.immoMapState);
        val[key] = value;
        localStorage.immoMapState = JSON.stringify(val);
      }
    },

    mounted() {
      this.$el.style.display = "block";
      this.updateInfo();
    },

    watch: {
      'state.esriSatellite'(val) {
        if (app.map && app.map.getLayer('satellite-esri')) {
          app.map.setLayoutProperty('satellite-esri', 'visibility', val ? 'visible' : 'none');
          app.map.setLayoutProperty('satellite-jaxa', 'visibility', (val ? false : app.vue.state.jaxaTerrainRgb) ? 'visible' : 'none');
        }
      },
      'state.jaxaTerrainRgb'(val) {
        if (app.map && app.map.getLayer('satellite-jaxa')) {
          app.map.setLayoutProperty('satellite-jaxa', 'visibility', (val && !app.vue.state.esriSatellite) ? 'visible' : 'none');
        }
      },
      'state.hillshades'(val) {
        if (app.map && app.map.getLayer('hillshading')) {
          app.map.setLayoutProperty('hillshading', 'visibility', val ? 'visible' : 'none');
        }
      },
      'state.osmVector'(val) {
        if (app.map && app.map.getStyle()) {
          app.map.getStyle().layers
            .filter(l => l.source === 'openmaptiles')
            .forEach(l => {
              let vis = val ? 'visible' : 'none';
              if (l.id === 'building-3d' && !app.vue.state.buildings3d) vis = 'none';
              app.map.setLayoutProperty(l.id, 'visibility', vis);
            });
        }
      },
      'state.buildings3d'(val) {
        if (app.map && app.map.getLayer('building-3d')) {
          app.map.setLayoutProperty('building-3d', 'visibility',
            (val && app.vue.state.osmVector) ? 'visible' : 'none');
        }
      },
      'state.globe'(val) {
        if (app.map && typeof app.map.setProjection === 'function') {
          app.map.setProjection({ type: val ? 'globe' : 'mercator' });
        }
        if (app.map && typeof app.map.setSky === 'function') {
          if (val) {
            app.map.setSky({
              'sky-color': '#000000',
              'horizon-color': '#000000',
              'fog-color': '#000000',
              'sky-horizon-blend': 0,
              'horizon-fog-blend': 0,
              'fog-ground-blend': 0,
              'atmosphere-blend': 0
            });
          } else {
            app.map.setSky(undefined);
          }
        }
      },

      stage(val) {
        this.saveState('stage', val);
        this.updateInfo();
      },

      state: {
        deep: true,
        // Will fire as soon as the component is created
        // immediate: true,
        handler(val) {
          this.$vuetify.theme.dark = val.theme === 'dark';
          this.stage = val.stage ? val.stage : 'Dev';

          window.setTimeout(() => window.dispatchEvent(new Event('resize')));

          return localStorage.immoMapState = JSON.stringify(val);
        }
      },

      async currentFrame(val, oldValue) {
        window.setTimeout(() => window.dispatchEvent(new Event('resize')));
      },
      //
      // currentFeature(val, oldValue) {
      //   window.setTimeout(() => window.dispatchEvent(new Event('resize')));
      // },

    }
  });

  let currentItemMenu = vue.items[0];
  currentItemMenu.model = true;

  // No frame selected by default
  vue.currentFrame = null;

  // Select land by default
  vue.country = vue.countries[0];

  // vue.model = vue.items[1];

  // Handle requests errors
  app.net.on('ready', result => {
    vue.snackbar = true;
    vue.snackbarError = result.errors ? result.errors : [];
    vue.snackbarText = result;
  });

  // Load style with absolute URLs for glyphs/sprite (MapLibre requires scheme+authority+path)
  const base = new URL('.', window.location.href).href.replace(/\/$/, '') + '/';
  const styleResp = await fetch('styles/osm-liberty-gl-style/style.json?x=' + Math.random());
  const style = await styleResp.json();
  style.glyphs = base + 'assets/fonts/map-fonts/{fontstack}/{range}.pbf';
  style.sprite = base + 'styles/osm-liberty-gl-style/sprites/osm-liberty';

  app.map = map = new maplibregl.Map({
    container:           'map',
    style:               style,
    hash:                true,
    refreshExpiredTiles: false,
    boxZoom:             false,
    maxPitch:            80,
    center:              [-16.5262, 28.1597],
    zoom:                11.05,
    bearing:             0,
    pitch:               55
  });

  map.on('load', () => {
    map.setTerrain({ source: 'terrain-dem', exaggeration: 2.5 });
    const s = app.vue.state;
    map.setLayoutProperty('satellite-esri', 'visibility', s.esriSatellite ? 'visible' : 'none');
    map.setLayoutProperty('satellite-jaxa', 'visibility', (s.jaxaTerrainRgb && !s.esriSatellite) ? 'visible' : 'none');
    map.setLayoutProperty('hillshading', 'visibility', s.hillshades ? 'visible' : 'none');
    map.getStyle().layers
      .filter(l => l.source === 'openmaptiles')
      .forEach(l => {
        let vis = s.osmVector ? 'visible' : 'none';
        if (l.id === 'building-3d' && !s.buildings3d) vis = 'none';
        map.setLayoutProperty(l.id, 'visibility', vis);
      });
    if (typeof map.setProjection === 'function' && s.globe) {
      map.setProjection({ type: 'globe' });
    }
    if (typeof map.setSky === 'function' && s.globe) {
      map.setSky({
        'sky-color': '#000000',
        'horizon-color': '#000000',
        'fog-color': '#000000',
        'sky-horizon-blend': 0,
        'horizon-fog-blend': 0,
        'fog-ground-blend': 0,
        'atmosphere-blend': 0
      });
    }
  });

  // Provide placeholder for missing sprite icons (e.g. railway_11, leisure_11 from POI class)
  map.on('styleimagemissing', (e) => {
    const id = e.id;
    if (map.hasImage(id)) return;
    const size = 17;
    const data = new Uint8Array(size * size * 4);
    map.addImage(id, { width: size, height: size, data }, { pixelRatio: 1 });
  });

  // Keyboard navigation: W zoom in, S zoom out, A slide left, D slide right, F invert, arrows roll
  const navKeys = new Set();
  const ZOOM_SPEED = 0.08;
  const PAN_SPEED = 12;
  const PITCH_SPEED = 1.5;
  const BEARING_SPEED = 2;
  const PITCH_MIN = 0;
  const PITCH_MAX = 80;

  const navStep = () => {
    if (navKeys.size === 0) return;
    navKeys.forEach(k => {
      if (k === 'w') map.zoomTo(map.getZoom() + ZOOM_SPEED, { duration: 0 });
      if (k === 's') map.zoomTo(map.getZoom() - ZOOM_SPEED, { duration: 0 });
      if (k === 'a') map.panBy([-PAN_SPEED, 0], { duration: 0 });
      if (k === 'd') map.panBy([PAN_SPEED, 0], { duration: 0 });
      if (k === 'ArrowUp') map.setPitch(Math.min(PITCH_MAX, map.getPitch() + PITCH_SPEED));
      if (k === 'ArrowDown') map.setPitch(Math.max(PITCH_MIN, map.getPitch() - PITCH_SPEED));
      if (k === 'ArrowLeft') map.setBearing(map.getBearing() - BEARING_SPEED);
      if (k === 'ArrowRight') map.setBearing(map.getBearing() + BEARING_SPEED);
    });
  };

  let navFrame = 0;
  const navLoop = () => {
    navFrame = requestAnimationFrame(navLoop);
    navStep();
  };
  navFrame = requestAnimationFrame(navLoop);

  const onNavKeyDown = (e) => {
    if (document.activeElement && document.activeElement.closest('input, textarea, [contenteditable="true"]')) return;
    const k = e.key;
    if (['w', 's', 'a', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(k)) {
      e.preventDefault();
      navKeys.add(k);
    }
    if (k === 'f') {
      e.preventDefault();
      map.setBearing((map.getBearing() + 180) % 360);
    }
  };
  const onNavKeyUp = (e) => navKeys.delete(e.key);
  window.addEventListener('keydown', onNavKeyDown);
  window.addEventListener('keyup', onNavKeyUp);

  map.on('remove', () => {
    cancelAnimationFrame(navFrame);
    window.removeEventListener('keydown', onNavKeyDown);
    window.removeEventListener('keyup', onNavKeyUp);
  });

  function popUp(lon, lat, html) {
    if(popup) {
      popup.remove();
    }

    popup = new maplibregl.Popup()
      .setLngLat([lon, lat])
      .setHTML('<div style="max-height: 300px; overflow: auto">' + html + '</div>')
      .addTo(map);
  }

  let showFeature = app.map.showFeature = (feature) => {
    // window.dispatchEvent(new Event('resize'));

    if(!feature || !feature.geometry) {
      vue.currentFeature = null;
      return;
    }

    let featureCollection = {
      type:     "FeatureCollection",
      features: [feature]
    };

    vue.currentFeature = feature;

    map.getSource('nominatim-regions').setData(featureCollection);

    let bounds = app.geo.utils.getBoundsByCoordinates(feature.geometry);
    try {
      let bearing = vue.state.isAnimated ? Math.random() * 50 : 0;

      map.fitBounds(bounds, {
        padding: 20,
        animate: vue.state.isAnimated,
        speed:   3, // make the flying slow
        bearing: bearing,
        maxZoom: 17.2,
        easing:  t => t,
      });
    } catch (e) {
      debugger
    }

    // map.flyTo({
    //   // These options control the ending camera position: centered at
    //   // the target, at zoom level 9, and north up.
    //   center:  feature.geometry.coordinates, // zoom: 9,
    //   // bearing: Math.random() * 50,
    //   animate: vue.state.isAnimated,
    //
    //   // These options control the flight curve, making it move
    //   // slowly and zoom out almost completely before starting
    //   // to pan.
    //   speed:  3, // make the flying slow
    //   curve:  1, // change the speed at which it zooms out
    //   zoom:   16, // This can be any easing function: it takes a number between
    //   // 0 and 1 and returns another number between 0 and 1.
    //   // easing: function(t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
    //   easing: t => t,
    // });

    let html;

    if(feature.title) {

      let htmlLines = feature.title.split(/,\s*/);

      htmlLines[0] = '<span style="font-weight: bold">' + htmlLines[0] + "</span>";

      if(feature.description) {
        htmlLines = htmlLines.concat(feature.description.split(/,\s*/));
      }

      html = htmlLines.join("</br>");

    } else {
      html = app.html.genPropertiesTable(feature.properties);
    }

    // let html = feature.title ?
    //   '<span style="font-weight: bold">' + feature.title.split(/,\s*/).join("<br/>") + "</span>" +
    //   "<br/>" + feature.description.split(/,\s*/).join("<br/>")
    //   :  app.html.genPropertiesTable(feature);
    let {lon, lat} = app.geo.utils.getFeatureCenter(feature);

    popUp(lon, lat, html);
  };

  map.on('load', () => {

    map.addSource('nominatim-regions', {
      type:       'geojson',
      data:       { type: 'FeatureCollection', features: [] }
    });

    if(app.vue.state.theme === "dark") {
      map.addLayer({
        'id':     'nominatim-regions',
        'type':   'fill',
        'source': 'nominatim-regions',
        'layout': {},
        'paint':  {
          'fill-color':   '#000000',
          'fill-opacity': 0.4
        }
      });
    } else {
      map.addLayer({
        'id':     'nominatim-regions',
        'type':   'fill',
        'source': 'nominatim-regions',
        'layout': {},
        'paint':  {
          'fill-color':   '#fbb900',
          'fill-opacity': 0.5
        }
      });
    }

    map.addLayer({
      id:     'search-result-text',
      type:   "symbol",
      source: 'nominatim-regions',
      layout: {
        "text-field": "{displayname}{name}",
        "text-font":  ["Roboto Bold"],
        "text-size":  20,
        "icon-size":      1,
        "text-anchor":    "center",
        "text-justify":   "center",
        "text-max-width": 30,
        "icon-pitch-alignment": "viewport",
        "icon-text-fit":        "none",
      },
      paint:  {
        "text-color":      "#333333",
        "text-halo-width": 1,
        "text-halo-color": "rgba(255,255,255,255.75)",
        "text-halo-blur":  1,
      }
    });

    map.addLayer({
      id:     'search-result-administration',
      type:   "symbol",
      source: 'nominatim-regions',
      layout: {
        "text-field": "{administration}",
        "text-font":  ["Roboto Bold"],
        "text-size":  20,
        "text-offset": [0, 1.2],
        "icon-size":  1,
        "text-anchor": "center",
        "text-justify": "center",
        "text-max-width": 30,
        "icon-pitch-alignment": "viewport",
        "icon-text-fit": "none",
      },
      paint:  {
        "text-color":      "rgba(51, 51, 51, 0.7)",
        "text-halo-width": 1,
        "text-halo-color": "rgba(255,255,255,0.75)",
        "text-halo-blur":  1,
      }
    });

    // var layer = map.addLayer({
    //   "id":           "building-3d",
    //   "type":         "fill-extrusion",
    //   "source":       "openmaptiles",
    //   "source-layer": "building",
    //   "minzoom":      13,
    //   "paint":        {
    //     "fill-extrusion-color":   "#c4b2a3",
    //     "fill-extrusion-height":  {
    //       "property": "render_height",
    //       "type":     "identity"
    //     },
    //     "fill-extrusion-base":    {
    //       "property": "render_min_height",
    //       "type":     "identity"
    //     },
    //     "fill-extrusion-opacity": 1
    //   },
    //   "layout":       {
    //     "visibility": "none"
    //   }
    // });

    map.addSource('geoid-regions', {
      type:       'geojson',
      data:       { type: 'FeatureCollection', features: [] }
    });

    map.addLayer({
      'id':     'geoid-regions',
      'type':   'fill',
      'source': 'geoid-regions',
      'layout': {
        // "text-field": "{display_name}",
        // "text-font":  ["Roboto Bold"],
        // "text-size":  12,
      },
      'paint':  {
        'fill-color':   '#496e41',
        'fill-opacity': 0.5
      }
    });

    map.on('mouseenter', layerName, function(e) {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', layerName, function(e) {
      map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'unclustered-point', function(e) {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'unclustered-point', function(e) {
      map.getCanvas().style.cursor = '';
    });

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.FullscreenControl());

    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions:   {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    );
  });
};
