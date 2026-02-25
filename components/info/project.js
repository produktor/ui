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
                  <a href="https://t.me/eSIider" target="_blank">Produktor Telegram PM</a>

                </form>
                </div>
              `,
  });
})();
