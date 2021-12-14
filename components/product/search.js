(() => {

  let me;

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
      sortName:  "",
      sortNames: [
        {'label': 'Unsort', id: ''},
        {'label': 'Street', id: 'street'},
        {'label': 'Postal code', id: 'postcode'},
        {'label': 'House number', id: 'housenumber'},
        {'label': 'Location ID', id: 'locationid'},
        {'label': 'Sub-Type', id: 'subtype'},
        {'label': 'Administration', id: 'administration'},
        {'label': 'Location Type ID', id: 'locationtypeid'},
        {'label': 'Suburb', id: 'suburb'},
        {'label': 'County', id: 'county'},
        {'label': 'City', id: 'city'},
        {'label': 'State', id: 'state'},
      ],
      sortTypes: [
        {'label': 'Ascending', id: 'asc'},
        {'label': 'Descending', id: 'desc'},
      ],
      sortType:  'asc',
      limit:     50,
      offset:    0,

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
                    label="Место"
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
                        {{ data.item.properties.displayname }} <span
                        class="grey--text lighten-4"
                        v-if="data.item.properties.category" style="text-transform: capitalize">&nbsp;({{ data.item.properties.category }})</span>
                      </template>
                    </template>
                  </v-autocomplete>
                </form>

                <v-divider></v-divider>


                <form class="v-card__text" onsubmit="return false">
                  <v-row>
                    <v-col
                      :md="sortName===''?6:3"
                    >
                      <v-select
                        prepend-icon="mdi-sort-variant"
                        v-model="sortName"
                        label="Sort by"
                        :items="sortNames"
                        :return-object="false"
                        persistent-hint
                        item-text="label"
                        item-value="id"
                      ></v-select>
                    </v-col>
                    <v-col
                      v-if="sortName!==''"

                    >
                      <v-select
                        v-model="sortType"
                        label="Order"
                        :items="sortTypes"
                        :return-object="false"
                        persistent-hint
                        item-text="label"
                        item-value="id"
                      ></v-select>
                    </v-col>
                    <v-col
                    >
                      <v-select
                        prepend-icon="mdi-arrow-collapse-left"
                        v-model="offset"
                        :items="[0, 10,20,30,50]"
                        :return-object="false"
                        label="Offset"
                        persistent-hint
                        item-text="label"
                        item-value="id"
                      ></v-select>
                    </v-col>
                    <v-col
                    >
                      <v-select
                        append-outer-icon="mdi-arrow-collapse-right"
                        v-model="limit"
                        :items="[10,20,30,50]"
                        :return-object="false"
                        label="Limit"
                        persistent-hint
                        item-text="label"
                        item-value="id"
                      ></v-select>
                    </v-col>
                  </v-row>
                </form>

                <v-divider></v-divider>
                </div>
              `,

    watch: {

      // on item select
      result(feature) {
        return;

        if(!feature || !feature.properties) return;

        if(me.loadPolygon === "1") {
          me.app.vue.getLocation(feature.properties.locationid, location => {
            location.properties = feature.properties;
            this.$emit('select', location);
          });
        } else {
          this.$emit('select', feature);
        }
      },

      // on input
      search: (value, old) => {

        return;

        // prevent the same search
        if(value === old) {
          return;
        }

        // stop search for nothing
        if(value == null) {
          me.isSearching = false;
          return;
        }

        me.isSearching = true;

        // No search without country and any chars
        if(value && value.length < 1 && !this.country) return;

        me.results = [];

        let sort = '';

        if(me.sortName !== '') {
          if(me.sortType !== '') {
            sort += me.sortType === 'asc' ? '+' : '-';
          }
          sort += me.sortName;
        }

        let url = 'api' + app.net.encode(value);

        app.net.request(url, fetcher => fetcher
          .then(response => {
            let results = response && response.features ? response.features : [];
            results.forEach(app.geo.utils.describeFeature);
            return me.results = results;
          })
          .finally(() => me.isSearching = false)
        );
      },
    },

  });
})();
