(() => {

  let me;

  Vue.component('info-questions', {
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
      </div>
    `,

  });
})();
