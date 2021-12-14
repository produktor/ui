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
      <form class="v-card__text" onsubmit="return false">
       Тут всё о проекте и его создателях.
      <br/>
      <br/>
       2021.
      </form>
      </div>
    `,
  });
})();
