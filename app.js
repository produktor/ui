"use strict";

document.onreadystatechange = async () => {
  if(document.readyState !== "complete") {
    return;
  }

  let vue, map;
  let layerName = 'immo';
  let popup;

  // Import components
  // (await import('./components/button-counter.js')).default();
  Vue.config.silent = false;

  let menuItems = [

    {
      icon:       'mdi-chevron-up',
      'icon-alt': 'mdi-chevron-down',
      text:       'Продукты',
      children:   [
        {
          icon: 'mdi-arrow-down-bold-box',
          text: 'Найти',
          id:   'product-receive'
        }, {
          icon: 'mdi-arrow-up-bold-box',
          text: 'Отдать',
          id:   'product-serve'
        }
      ],
    },
    {//                 <v-icon>mdi-map</v-icon>
      icon:       'mdi-chevron-up',
      'icon-alt': 'mdi-chevron-down',
      text:       'Сервис',
      onDebug:    true,
      children:   [

        {
          icon: 'mdi-arrow-down-bold-box-outline',
          text: 'Найти',
          id:   'service-receive'
        },
        {
          icon: 'mdi-arrow-up-bold-box-outline',
          text: 'Предоставить',
          id:   'service-serve'
        }
      ],
    },
    {
      icon:       'mdi-chevron-dio',
      'icon-alt': 'mdi-chevron-down',
      text:       'Инфо',
      children:   [
        {
          icon: 'mdi-head-question-outline',
          text: 'Вопросы',
            id:   'info-questions'
        },
        {
          icon: 'mdi-information',
          text: 'О Проекте',
          id:   'info-project'
        },
        {
          icon: 'mdi-copyright',
          text: 'Лицензия',
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
        {id: 'DE', label: 'Germany'},
        {id: 'AT', label: 'Austria'},
        {id: 'CH', label: 'Switzerland'}
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
    },

    methods: {

      /**
       * Get location by ID
       *
       * @param {int} id
       * @param {function} onFeature
       */
      getLocation(id, onFeature) {
        let wktReader = new Wkt.Wkt(result.wktGeometry);
        onFeature( feature = {
          type:       "Feature",
          id:         app.geo.utils.genUUID(),
          geometry:   wktReader.toJson(),
          properties: {
            id: id
          }
        })
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
       * Get Immonet geo info by location ID
       *
       * @param {int} locationId
       * @param {function} onResult
       */
      getImmonetGeoInfo(locationId, onResult) {
        let result;

        app.net.request(`api.php?act=immonetgeobylocationid&stage=${this.stage}&id=${locationId}`, fetcher => {
          fetcher.then(response => {

            if(!response || !response.result)
              return;

            result = response.result;

          }).finally(() =>
            onResult(result)
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

      /**
       * Get on premise location by immowelt geo ID
       *
       * @param immoweltGeoId
       * @param {function} onResult
       */
      getImmoweltGeoInfoFromOnPremise(immoweltGeoId,  onResult) {
        let result;

        app.net.request(`api.php?act=getimmoweltgeoinfofromonpremise&stage=${this.stage}&id=${immoweltGeoId}`, fetcher => {
          fetcher.then(response => {

            result = response.result;

            if(!response || !response.result)
              return;

          }).finally(() =>
            onResult(result)
          );
        });
      },

      // Get update version info
      updateInfo() {
        this.versions = {
          "uiVersion": "0.1.12b",
          "map": "Canary 2021.12"
        }
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

  // Select first menu item frame
  vue.currentFrame = currentItemMenu.children[0];

  // Select land by default
  vue.country = vue.countries[0];

  // vue.model = vue.items[1];

  // Handle requests errors
  app.net.on('ready', result => {
    vue.snackbar = true;
    vue.snackbarError = result.errors ? result.errors : [];
    vue.snackbarText = result;
  });

  app.map = map = new mapboxgl.Map({
    container:           'map',
    style:               'styles/map.style.json',
    hash:                true, // antialias: true,
    refreshExpiredTiles: false,
    boxZoom:             false,
    // 10.73/28.354/-16.4001/-98.4/60
    center:              [-16.5262,28.1597],
    zoom:                11.05,
    bearing:             0,
    pitch:               55
  });

  function popUp(lon, lat, html) {
    if(popup) {
      popup.remove();
    }

    popup = new mapboxgl.Popup()
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
      type: 'geojson',
      data: null
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
        "text-field":         "{displayname}{name}\n{administration}",
        "text-font":          ["Open Sans Bold"],
        "text-size":          20,
        // "text-offset":        [0, 0.5],
        "icon-size":          1,
        "text-anchor":        "center",
        "text-justify": "center",
        "text-max-width":     30,
        // "icon-allow-overlap": true,
        // "icon-optional":      true,
        "icon-pitch-alignment": "viewport",
        "icon-text-fit": "none",
        // "text-offset":  [0, 10],
        // "text-rotation-alignment": "map"
        // "symbol-placement": "line-center",

        // "line-cap": "square",
        // "line-join": "bevel"
      },
      paint:  {
        "text-color":      "#333333",
        "text-halo-width": 1,
        "text-halo-color": "rgba(255,255,255,255.75)",
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
      type: 'geojson',
      data: null
    });

    map.addLayer({
      'id':     'geoid-regions',
      'type':   'fill',
      'source': 'geoid-regions',
      'layout': {
        // "text-field": "{display_name}",
        // "text-font":  ["Open Sans Bold"],
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

    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
    map.addControl(new mapboxgl.FullscreenControl());

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions:   {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      })
    );
  });
};
