import {PhotonApiClient} from '../photon-api-client.js';

(() => {
  const photonApiClient = new PhotonApiClient();

  function featureCenter(feature) {
    if(!feature || !feature.geometry) return null;
    return app.geo.utils.getFeatureCenter(feature);
  }

  Vue.component('route-form', {
    props: {
      app: {twoWay: true},
    },
    data: () => ({
      from: null,
      to: null,
      fromSearch: null,
      toSearch: null,
      fromResults: [],
      toResults: [],
      fromLoading: false,
      toLoading: false,
      fromRequestId: 0,
      toRequestId: 0,
      routeInfo: null,
      routeError: null,
      routing: false,
      _fromTimer: null,
      _toTimer: null,
    }),
    template: `
      <div class="route-form">
        <form class="v-card__text" onsubmit="return false">
          <v-autocomplete
            v-model="from"
            :loading="fromLoading"
            :items="fromResults"
            :search-input.sync="fromSearch"
            label="From"
            prepend-icon="mdi-circle-slice-8"
            hide-no-data
            hide-details="auto"
            clearable
            no-filter
            return-object
            item-text="title"
            item-value="id"
            autofocus
            class="mb-3"
          >
            <template v-slot:selection="data">
              <span v-if="data && data.item">{{ data.item.title || data.item.properties.name }}</span>
            </template>
            <template slot="item" slot-scope="data">
              <span v-if="data && data.item">{{ data.item.title || data.item.properties.name }}</span>
            </template>
          </v-autocomplete>

          <div class="route-form__swap mb-3">
            <v-btn icon small @click="swapEnds" aria-label="Swap from and to">
              <v-icon>mdi-swap-vertical</v-icon>
            </v-btn>
          </div>

          <v-autocomplete
            v-model="to"
            :loading="toLoading"
            :items="toResults"
            :search-input.sync="toSearch"
            label="To"
            prepend-icon="mdi-map-marker"
            hide-no-data
            hide-details="auto"
            clearable
            no-filter
            return-object
            item-text="title"
            item-value="id"
            class="mb-4"
          >
            <template v-slot:selection="data">
              <span v-if="data && data.item">{{ data.item.title || data.item.properties.name }}</span>
            </template>
            <template slot="item" slot-scope="data">
              <span v-if="data && data.item">{{ data.item.title || data.item.properties.name }}</span>
            </template>
          </v-autocomplete>

          <v-alert v-if="routeError" type="warning" dense text class="mb-3">
            {{ routeError }}
          </v-alert>

          <v-card v-if="routeInfo" flat outlined class="pa-3 mb-2">
            <div><strong>{{ routeInfo.km }} km</strong> · ~{{ routeInfo.min }} min</div>
            <div class="caption" style="opacity: .7">Driving · OSRM</div>
          </v-card>

          <v-progress-linear v-if="routing" indeterminate class="mb-2"></v-progress-linear>
        </form>
      </div>
    `,
    methods: {
      mapBias() {
        const map = this.app && this.app.map;
        if(map && map.getCenter) {
          const c = map.getCenter();
          return {lon: c.lng, lat: c.lat};
        }
        return {lon: -16.2518, lat: 28.4636};
      },

      searchPlaces(query, which) {
        const q = (query || '').trim();
        const loadingKey = which + 'Loading';
        const resultsKey = which + 'Results';
        const requestKey = which + 'RequestId';
        const timerKey = '_' + which + 'Timer';

        window.clearTimeout(this[timerKey]);

        if(q.length < 2) {
          this[loadingKey] = false;
          this[resultsKey] = [];
          return;
        }

        const requestId = this[requestKey] + 1;
        this[requestKey] = requestId;
        this[loadingKey] = true;

        this[timerKey] = window.setTimeout(async () => {
          try {
            const bias = this.mapBias();
            const response = await photonApiClient.search(q, {
              limit: 8,
              lon: bias.lon,
              lat: bias.lat,
            });
            let results = response && response.features ? response.features : [];
            results.forEach(app.geo.utils.describeFeature);
            if(this[requestKey] !== requestId) return;
            this[resultsKey] = results;
          } catch (_) {
            if(this[requestKey] !== requestId) return;
            this[resultsKey] = [];
          } finally {
            if(this[requestKey] === requestId) {
              this[loadingKey] = false;
            }
          }
        }, 250);
      },

      swapEnds() {
        const from = this.from;
        const to = this.to;
        const fromSearch = this.fromSearch;
        const toSearch = this.toSearch;
        this.from = to;
        this.to = from;
        this.fromSearch = toSearch;
        this.toSearch = fromSearch;
      },

      async planRoute() {
        this.routeError = null;
        this.routeInfo = null;

        if(!this.from || !this.to) {
          if(this.app && this.app.map && this.app.map.clearRoute) {
            this.app.map.clearRoute();
          }
          return;
        }

        const fromC = featureCenter(this.from);
        const toC = featureCenter(this.to);
        if(!fromC || !toC) return;

        this.routing = true;
        try {
          if(this.app && this.app.map && this.app.map.showRouteBetween) {
            const info = await this.app.map.showRouteBetween(this.from, this.to);
            if(info) {
              this.routeInfo = info;
            } else {
              this.routeError = 'No driving route found for these points.';
            }
          }
        } catch (e) {
          console.warn(e);
          this.routeError = 'Routing failed. Try other places in the covered area.';
        } finally {
          this.routing = false;
        }
      },

      /**
       * Prefill "To" from an external query (e.g. property click).
       * @param {string} query
       */
      async setToQuery(query) {
        const q = (query || '').trim();
        if(q.length < 2) return;
        this.toSearch = q;
        this.toLoading = true;
        try {
          const bias = this.mapBias();
          const response = await photonApiClient.search(q, {
            limit: 8,
            lon: bias.lon,
            lat: bias.lat,
          });
          let results = response && response.features ? response.features : [];
          results.forEach(app.geo.utils.describeFeature);
          this.toResults = results;
          if(results[0]) this.to = results[0];
        } catch (_) {
          this.toResults = [];
        } finally {
          this.toLoading = false;
        }
      },
    },
    watch: {
      fromSearch(value, old) {
        if(value === old) return;
        this.searchPlaces(value, 'from');
      },
      toSearch(value, old) {
        if(value === old) return;
        this.searchPlaces(value, 'to');
      },
      from() {
        this.planRoute();
      },
      to() {
        this.planRoute();
      },
    },
    mounted() {
      // Expose instance for app helpers (property → To)
      if(this.app && this.app.vue) {
        this.app.vue._routeForm = this;
        const pending = this.app.vue._pendingRouteToQuery;
        if(pending) {
          this.app.vue._pendingRouteToQuery = null;
          this.setToQuery(pending);
        }
      }
    },
    beforeDestroy() {
      if(this.app && this.app.vue && this.app.vue._routeForm === this) {
        this.app.vue._routeForm = null;
      }
    },
  });
})();
