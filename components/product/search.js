import { PhotonApiClient } from '../photon-api-client.js';

(() => {

  let me;
  const photonApiClient = new PhotonApiClient();

  Vue.component('product-search', {
    mounted() {
      me = this;
    },
    props:    {
      'app':       {twoWay: true},
      'countries': {twoWay: true},
      'country':   {twoWay: true},
      'stage':     {}
    },
    data:     () => ({
      limit:  50,
      offset: 0,

      displayNameFormat:  "",
      displayNameFormats: [
        {'label': 'Standard', id: ""},
        {'label': 'Pricemap', id: 'pricemap'},
      ],

      country:     'DE',
      countries:   [],
      results:     [],
      result:      null,
      isSearching: false,
      search:      null,

      loadPolygon: "1",
    }),
    model:    {
      event: 'select'
    },
    template: `
                <div>

                <form class="v-card__text" onsubmit="return false">
                  <v-autocomplete
                    v-model="result"
                    :loading="isSearching"
                    :items="results"
                    :search-input.sync="search"
                    label="search subject e.g. 'Iphone, XS, 300'"
                    prepend-icon="mdi-city"
                    persistent-hint
                    hide-no-data
                    allow-overflow
                    auto-select-first
                    single-line
                    no-filter
                    return-object
                    item-text="title"
                    item-value="id"
                    autofocus
                  >
                    <template v-slot:selection="data">
                      <template v-if="data && data.item">
                        {{ data.item.title }}
                      </template>
                    </template>
                    <template slot="item" slot-scope="data">
                      <template v-if="data && data.item">
                        {{ data.item.title || data.item.properties.name }}
                      </template>
                    </template>
                  </v-autocomplete>
                </form>


                </div>
              `,

    watch: {

      // on item select
      result(feature) {
        if(!feature || !feature.properties) return;
        this.$emit('select', feature);
      },

      // on input
      search: (value, old) => {

        // prevent the same search
        if(value === old) {
          return;
        }

        // stop search for nothing
        if(value == null) {
          me.isSearching = false;
          return;
        }

        // No search without country and any chars
        if(value && value.length < 1) return;

        me.isSearching = true;

        photonApiClient.search(value, { limit: me.limit })
          .then(response => {
            let results = response && response.features ? response.features : [];
            results.forEach(app.geo.utils.describeFeature);
            me.results = results;
          })
          .catch(() => {
            me.results = [];
          })
          .finally(() => me.isSearching = false);
      },
    },

  });
})();
