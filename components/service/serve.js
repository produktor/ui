(() => {

  let me;

  Vue.component('service-serve', {
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
      displayNameFormat:  "",
      displayNameFormats: [
        {'label': 'Стандартный', id: ""},
        {'label': 'Перевозки', id: 'delivery'},
        {'label': 'Обмен', id: 'обмен'},
        {'label': 'Спорт', id: 'pricemap'},
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

                    label="Place"
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

                  <v-row>
                    <v-col
                      :md="12"
                    >
                      <v-select
                        prepend-icon="mdi-monitor"
                        v-model="displayNameFormat"
                        label="Тип сервиса"
                        :items="displayNameFormats"
                        :return-object="false"
                        persistent-hint
                        item-text="label"
                        item-value="id"
                      ></v-select>
                    </v-col>
                  </v-row>
                </form>

                <v-divider></v-divider>

 <v-row>

    <v-col>
      <v-sheet height="400">

        Calendar
        <v-calendar

          category-show-all
          ref="calendar"
          color="primary"
          type="week"
        ></v-calendar>
      </v-sheet>
    </v-col>
  </v-row>

                <v-divider></v-divider>

                <form class="v-card__text" onsubmit="return false">

                  <v-checkbox
                    v-if="app.vue.state.isDebug"
                    v-model="app.vue.state.isDebug && loadPolygon"
                    value="1"
                    label="Включить сервис в общий поиск?"
                    type="checkbox"
                  ></v-checkbox>
                </form>
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
