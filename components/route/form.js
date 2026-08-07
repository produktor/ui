import {PhotonApiClient} from '../photon-api-client.js';

(() => {
  const photonApiClient = new PhotonApiClient();

  const TRAVEL_MODES = [
    {id: 'driving', label: 'Car', icon: 'mdi-car', available: true},
    {id: 'walking', label: 'Walk', icon: 'mdi-walk', available: true},
    {id: 'cycling', label: 'Bike', icon: 'mdi-bike', available: true},
  ];

  function featureCenter(feature) {
    if(!feature || !feature.geometry) return null;
    return app.geo.utils.getFeatureCenter(feature);
  }

  function featureLabel(feature) {
    if(!feature) return '';
    return feature.title
      || (feature.properties && (feature.properties.display_name || feature.properties.name))
      || '';
  }

  /** Stable key for v-autocomplete item-value (Photon osm ids or lon/lat). */
  function featureKey(feature) {
    if(!feature) return '';
    const p = feature.properties || {};
    if(p.osm_type != null && p.osm_id != null) {
      return `${p.osm_type}:${p.osm_id}`;
    }
    const c = feature.geometry && feature.geometry.coordinates;
    if(c) return `${c[0]},${c[1]}`;
    return feature.id || '';
  }

  function prepareFeatures(features) {
    (features || []).forEach(f => {
      app.geo.utils.describeFeature(f);
      f.id = featureKey(f) || f.id;
      if(!f.properties) f.properties = {};
      if(!f.properties.display_name) {
        f.properties.display_name = f.title || f.properties.name || f.id;
      }
    });
    return features || [];
  }

  Vue.component('route-form', {
    props: {
      app: {twoWay: true},
    },
    data: () => ({
      from: null,
      to: null,
      fromSearch: '',
      toSearch: '',
      fromResults: [],
      toResults: [],
      fromLoading: false,
      toLoading: false,
      fromRequestId: 0,
      toRequestId: 0,
      profile: 'driving',
      travelModes: TRAVEL_MODES,
      routeInfo: null,
      routeError: null,
      routing: false,
      _fromTimer: null,
      _toTimer: null,
      _suppressFromSearch: false,
      _suppressToSearch: false,
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
            @change="onFromSelected"
          >
            <template v-slot:selection="data">
              <span v-if="data && data.item">{{ labelOf(data.item) }}</span>
            </template>
            <template slot="item" slot-scope="data">
              <span v-if="data && data.item">{{ labelOf(data.item) }}</span>
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
            @change="onToSelected"
          >
            <template v-slot:selection="data">
              <span v-if="data && data.item">{{ labelOf(data.item) }}</span>
            </template>
            <template slot="item" slot-scope="data">
              <span v-if="data && data.item">{{ labelOf(data.item) }}</span>
            </template>
          </v-autocomplete>

          <div class="mb-4">
            <div class="caption mb-2" style="opacity:.7">Travel mode</div>
            <v-btn-toggle v-model="profile" mandatory dense class="route-form__modes">
              <v-btn
                v-for="mode in travelModes"
                :key="mode.id"
                :value="mode.id"
                :disabled="!mode.available"
                small
              >
                <v-icon left small>{{ mode.icon }}</v-icon>
                {{ mode.label }}
              </v-btn>
            </v-btn-toggle>
          </div>

          <v-btn
            color="primary"
            block
            class="mb-3"
            :disabled="!canCalculate"
            :loading="routing"
            @click="planRoute"
          >
            <v-icon left>mdi-routes</v-icon>
            Calculate route
          </v-btn>

          <v-alert v-if="routeError" type="warning" dense text class="mb-3">
            {{ routeError }}
          </v-alert>

          <v-card v-if="routeInfo" flat outlined class="pa-3 mb-2">
            <div><strong>{{ routeInfo.km }} km</strong> · ~{{ routeInfo.min }} min</div>
            <div class="caption" style="opacity: .7">{{ profileLabel }} · OSRM</div>
          </v-card>
        </form>
      </div>
    `,
    computed: {
      canCalculate() {
        return !!(this.from && this.to && !this.routing);
      },
      profileLabel() {
        const mode = this.travelModes.find(m => m.id === this.profile);
        return mode ? mode.label : this.profile;
      },
    },
    methods: {
      labelOf: featureLabel,

      mapBias() {
        const map = this.app && this.app.map;
        if(map && map.getCenter) {
          const c = map.getCenter();
          return {lon: c.lng, lat: c.lat};
        }
        return {lon: -16.2518, lat: 28.4636};
      },

      keepSelectedInList(which) {
        const selected = which === 'from' ? this.from : this.to;
        const resultsKey = which + 'Results';
        if(!selected) return;
        const key = featureKey(selected);
        const list = this[resultsKey] || [];
        if(!list.some(item => featureKey(item) === key)) {
          this[resultsKey] = [selected, ...list];
        }
      },

      onFromSelected(value) {
        if(!value) {
          this.routeInfo = null;
          return;
        }
        this._suppressFromSearch = true;
        this.fromSearch = featureLabel(value);
        this.keepSelectedInList('from');
        this.$nextTick(() => { this._suppressFromSearch = false; });
      },

      onToSelected(value) {
        if(!value) {
          this.routeInfo = null;
          return;
        }
        this._suppressToSearch = true;
        this.toSearch = featureLabel(value);
        this.keepSelectedInList('to');
        this.$nextTick(() => { this._suppressToSearch = false; });
      },

      searchPlaces(query, which) {
        const q = (query || '').trim();
        const loadingKey = which + 'Loading';
        const resultsKey = which + 'Results';
        const requestKey = which + 'RequestId';
        const timerKey = '_' + which + 'Timer';
        const selected = which === 'from' ? this.from : this.to;

        window.clearTimeout(this[timerKey]);

        // Keep current selection visible; do not wipe the list on clear/blur.
        if(q.length < 2) {
          this[loadingKey] = false;
          this[resultsKey] = selected ? [selected] : [];
          return;
        }

        // Typing while a place is selected: ignore echo of the label.
        if(selected && q === featureLabel(selected)) {
          this.keepSelectedInList(which);
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
            let results = prepareFeatures(response && response.features ? response.features : []);
            if(this[requestKey] !== requestId) return;
            if(selected) {
              const key = featureKey(selected);
              if(!results.some(item => featureKey(item) === key)) {
                results = [selected, ...results];
              }
            }
            this[resultsKey] = results;
          } catch (_) {
            if(this[requestKey] !== requestId) return;
            this[resultsKey] = selected ? [selected] : [];
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
        const fromResults = this.fromResults;
        const toResults = this.toResults;
        this._suppressFromSearch = true;
        this._suppressToSearch = true;
        this.from = to;
        this.to = from;
        this.fromSearch = toSearch;
        this.toSearch = fromSearch;
        this.fromResults = toResults;
        this.toResults = fromResults;
        this.routeInfo = null;
        this.$nextTick(() => {
          this._suppressFromSearch = false;
          this._suppressToSearch = false;
        });
      },

      async planRoute() {
        this.routeError = null;
        this.routeInfo = null;

        if(!this.from || !this.to) {
          this.routeError = 'Choose both From and To.';
          return;
        }

        const fromC = featureCenter(this.from);
        const toC = featureCenter(this.to);
        if(!fromC || !toC) {
          this.routeError = 'Could not read coordinates for the selected places.';
          return;
        }

        this.routing = true;
        try {
          if(this.app && this.app.map && this.app.map.showRouteBetween) {
            const info = await this.app.map.showRouteBetween(this.from, this.to, {
              profile: this.profile,
            });
            if(info) {
              this.routeInfo = info;
            } else {
              this.routeError = `No ${this.profileLabel.toLowerCase()} route found for these points.`;
            }
          }
        } catch (e) {
          console.warn(e);
          this.routeError = 'Routing failed. Try another mode or places in the covered area.';
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
        this._suppressToSearch = true;
        this.toSearch = q;
        this.toLoading = true;
        try {
          const bias = this.mapBias();
          const response = await photonApiClient.search(q, {
            limit: 8,
            lon: bias.lon,
            lat: bias.lat,
          });
          let results = prepareFeatures(response && response.features ? response.features : []);
          this.toResults = results;
          if(results[0]) {
            this.to = results[0];
            this.toSearch = featureLabel(results[0]);
          }
        } catch (_) {
          this.toResults = [];
        } finally {
          this.toLoading = false;
          this.$nextTick(() => { this._suppressToSearch = false; });
        }
      },
    },
    watch: {
      fromSearch(value, old) {
        if(this._suppressFromSearch) return;
        if(value === old) return;
        this.searchPlaces(value, 'from');
      },
      toSearch(value, old) {
        if(this._suppressToSearch) return;
        if(value === old) return;
        this.searchPlaces(value, 'to');
      },
      from(value) {
        if(!value) this.routeInfo = null;
      },
      to(value) {
        if(!value) this.routeInfo = null;
      },
      profile() {
        this.routeInfo = null;
      },
    },
    mounted() {
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
