(() => {

  let me;

  Vue.component('info-terms', {
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
        To be done.
      </form>
      </div>
    `,

  });
})();
