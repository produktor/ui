(() => {

  let me;

  Vue.component('info-license', {
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
      <form class="v-card__text" onsubmit="return false">
          Лицензионное соглашение
      </form>
      </div>
              `,
  });
})();
