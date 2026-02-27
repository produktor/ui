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

                  <h3 class="mb-3 mt-4">Project Team</h3>
                  <p class="body-2 mb-3">
                    We are a engineer and designer team  with over 15 years of hands-on experience delivering
                    reliable technical solutions across software and hardware domains.
                  </p>

                  <p class="body-2 mb-3">
                    Our background includes project engineering in manufacturing, full-stack development
                    (front-end and back-end), data scraping and analysis, embedded systems for drone
                    navigation, AI-based object recognition, and business process automation using modern
                    AI tools.
                  </p>

                  <p class="body-2 mb-3">
                    Our team includes a seniors in GIS Fullstack/DevOps Engineering based in Tenerife, with
                    overaal 15+ years of experience as a senior software engineer and solution architect.
                    We design and operate reliable, scalable, high-performance local systems for
                    terabyte-scale geospatial data, with specialization in self-hosted OSM/OSS stacks,
                    ETL pipelines, and low-latency backends, including sub-10 ms scenarios.
                  </p>

                  <p class="body-2 mb-3">
                    Our GIS and platform engineering delivery covers spatial databases and end-to-end
                    implementation across data, backend, frontend, and operations - including PostGIS/
                    PostgreSQL, SpatiaLite, Oracle Spatial, MBTiles, and vector tile workflows - helping
                    organizations avoid big-tech lock-in while retaining on-premise operational control.
                  </p>

                  <p class="body-2 mb-3">
                    We focus on practical results: clear architecture, clean implementation, and systems
                    that work reliably in real conditions. We are comfortable taking ownership of complex
                    tasks - from idea to deployment - and delivering solutions that clients can depend on.
                  </p>
                  <v-divider class="my-3"></v-divider>
                  <p class="body-2 mb-4">Don't hesitate to contact us via:
                   <a href="https://t.me/eSIider" target="_blank" rel="noopener" class="body-2">Telegram</a>
                  or email: <a href="mailto:esider@gmail.com" target="_blank" rel="noopener" class="body-2">esider@gmail.com</a>
                  </p>

                </div>
              `,
  });
})();
