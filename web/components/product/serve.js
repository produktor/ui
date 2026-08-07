(() => {

  let me;

  Vue.component('product-serve', {
    mounted() {
      me = this;
    },
    props: {
      'app':       {twoWay: true},
      'countries': {twoWay: true},
      'country':   {twoWay: true},
      'stage':     {}
    },
    data:  () => ({
      results:     [],
      result:      null,
      isSearching: false,
      search:      null,
      loadPolygon: "1",
    }),
    model: {
      event: 'select'
    },

    // on upload button click
    methods: {
      upload() {
        let file = this.$refs.file.files[0];
        if(!file) return;
        let reader = new FileReader();
        reader.onload = (e) => {
          let data = e.target.result;
          this.$emit('upload', data);
        };
        reader.readAsText(file);
      }
    },

    watch:       {

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
    }, template: `<form class="v-card__text" onsubmit="return false">

    <!-- Upload image -->
    <v-file-input 
      prepend-icon="mdi-upload"
      label="Upload image"
      persistent-hint
      accept="image/*"
      multiple
      chips
      multiple
      show-size
      counter
      outlined
      ref="file"
    ></v-file-input>
    
    <v-divider></v-divider>
    
    <!-- Upload button -->
    <v-btn
      color="primary"
      class="mr-4"
      @click="upload"
      
    >Upload!</v-btn>
  </form>`,
  });
})();
