(() => {

  let me;

  Vue.component('info-project', {
    mounted() {
      me = this;
    },
    props:    {
      'app':   {twoWay: true},
      'stage': {twoWay: true},
    },
    data:     () => ({}),
    model:    {
      event: 'select'
    },
    template: `
                <div class="about-purpose pa-3">
                  <h3 class="mb-3">Demo</h3>
                  <p class="body-2 mb-3">
                    This is a working demo of a GIS map UI for
                    <a href="https://produktor.io" target="_blank" rel="noopener">produktor.io</a>.
                    It is not a finished product — only a live showcase of how a map app can look and behave
                    in that stack.
                  </p>

                  <h3 class="mb-3 mt-4">What you can do</h3>
                  <ul class="body-2 mb-3 pl-4">
                    <li class="mb-2">Browse an interactive map (pan, zoom, tilt, theme and layer toggles).</li>
                    <li class="mb-2">Search places and plan a driving route from A to B.</li>
                    <li class="mb-2">Inspect place details on the map after a search or route.</li>
                  </ul>

                  <h3 class="mb-3 mt-4">Credits &amp; licences</h3>
                  <p class="body-2 mb-2">
                    Map data ©
                    <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>
                    contributors (ODbL).
                  </p>
                  <p class="body-2 mb-2">
                    Geocoding and routing use OpenStreetMap-based open services
                    (<a href="https://github.com/komoot/photon" target="_blank" rel="noopener">Photon</a>,
                    <a href="https://project-osrm.org/" target="_blank" rel="noopener">OSRM</a>).
                  </p>
                  <p class="body-2 mb-2">
                    Map rendering:
                    <a href="https://maplibre.org/" target="_blank" rel="noopener">MapLibre GL</a>
                    (BSD). Styles based on OpenMapTiles /
                    <a href="https://github.com/maputnik/osm-liberty" target="_blank" rel="noopener">OSM Liberty</a>.
                  </p>
                  <p class="body-2 mb-4">
                    UI:
                    <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue.js</a>
                    and
                    <a href="https://vuetifyjs.com/" target="_blank" rel="noopener">Vuetify</a>
                    (MIT).
                  </p>
                </div>
              `,
  });
})();
