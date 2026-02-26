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
                  <h3 class="mb-3">Purpose</h3>
                  <p class="body-2 mb-3">
                    Produktor is a map-based platform for sharing and discovering products and services
                    locally. It connects people who want to give away items with those looking to find them,
                    and enables service providers and seekers to find each other.
                  </p>
                  <p class="body-2 mb-3">
                    The interactive map lets you search by location, browse offerings in your area,
                    and visualize where goods and services are available. Built for local communities
                    and sustainable sharing.
                  </p>

                  <h3 class="mb-3 mt-4">Author</h3>
                  <p class="body-2 mb-3">
                    Senior GIS Fullstack/DevOps Engineer. Tenerife-based. 10+ years experience as Senior Software Engineer and Solution Architect. Builds reliable, scalable, high-performance on-premise systems for terabyte-scale geospatial data. Specializes in self-hosted OSM/OSS stacks, ETL pipelines, high-availability backends with sub-10ms response times, PostGIS/PostgreSQL, and fullstack delivery avoiding big-tech lock-in.
                  </p>
                  <p class="body-2 mb-2"><strong>Core deliverables:</strong></p>
                  <ul class="body-2 pl-4 mb-3" style="list-style-type: disc;">
                    <li class="mb-2">On-premise backend: serves vector/raster tiles and GeoJSON from OSM/OSS sources on UX request. Full tile caching. HA configuration.</li>
                    <li class="mb-2">Interactive map frontend (latest base product): <a href="https://github.com/produktor/ui" target="_blank" rel="noopener">produktor/ui</a>. Integrates hillshades, 3D houses, OSM data via MBTiles and vectors. Keyboard + mouse navigation in 3D space. Multiple layer/display options. 3D demo and standard demo included. JS/CSS/HTML stack (71.8% JS).</li>
                    <li class="mb-2">Mapbender surface digitizer implementation and contributions to Mapbender configurator and vis-ui.js.</li>
                    <li class="mb-2"><a href="https://github.com/eSlider/geo-tools" target="_blank" rel="noopener">geo-tools</a>: Go-based. Extracts PBF/JPEG/WebP/PNG tiles from MBTiles. Extracts GeoJSON features via geocoder. Concurrent processing for large datasets (world-vector.mbtiles, Canary Islands examples).</li>
                    <li class="mb-2"><a href="https://github.com/eSlider/spatialite" target="_blank" rel="noopener">spatialite</a>: Static Linux binaries + PHP wrapper driver. Lightweight file-based spatial DBMS equivalent to PostgreSQL + PostGIS. Composer-installable.</li>
                  </ul>
                  <p class="body-2 mb-3">
                    <a href="https://github.com/eSlider/" target="_blank" rel="noopener">GitHub</a>. Pinned activity in data engineering, self-hosted infrastructure, Go backend services. Skills matrix: Go, JavaScript, PostGIS, MBTiles, vector tiles, ETL, Docker, on-premise HA, spatialite/SQLite alternatives.
                  </p>
                  <v-divider class="my-3"></v-divider>
                  <p class="body-2 mb-4">Don't hesitate to contact me via:
                   <a href="https://t.me/eSIider" target="_blank" rel="noopener" class="body-2">Telegram</a>
                  or email: <a href="mailto:esider@gmail.com" target="_blank" rel="noopener" class="body-2">esider@gmail.com</a>
                  </p>

                </div>
              `,
  });
})();
