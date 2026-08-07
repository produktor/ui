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
                <div>
                <form>
                  <a href="https://github.com/produktor/web" target="_blank">Produktor info portal</a>

                </form>
                </div>
              `,
  });
})();
