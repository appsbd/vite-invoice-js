import { createApp, markRaw, h } from 'vue';
import App from './App.vue';
import AppsbdUI, {
  AppsbdUIConfigure,
  translateGetMsg,
} from '@appsbd/vue3-appsbd-ui';
import '@appsbd/vue3-elite-grid/elite-grid.css';
import './assets/scss/style.scss';
import '@appsbd/vue3-appsbd-ui/style.css';
import '@appsbd/vue3-appsbd-ui/skins/green.css';
import { createAppsbdURL } from '@lib/AppsbdURL.js';
import pinia from '@lib/store.js';
import ACL from '@lib/acl.js';
import adminRoutes from './router/index.js';
import AppsbdVeeRules from '@lib/AppsbdVeeRules.js';
import attrOption from '@lib/attrOption.js';
import gettext, { digits } from '@lib/lang.js';

const windowVar = window.apbd_vite_invoice || {};
console.log(windowVar);
createAppsbdURL({
  ajax_url: windowVar.ajax_url,
  action_prefix: windowVar.action_prefix,
});

// Digits follow the active language (window.apbd_vite_invoice_lang, see @lib/lang.js and
// vite_invoice/libs/class-lang-asset.php), so Bangla shows Bangla numerals and English shows Latin.
AppsbdUIConfigure({
  digits: digits,
  is24Hour: false,
  dateDataFormat: 'YYYY-MM-DD',
  dateDisplayFormat: 'DD/MM/YYYY',
  datetimeDataFormat: 'YYYY-MM-DD HH:mm',
  datetimeDisplayFormat: 'DD/MM/YYYY hh:mm a',
  timeDataFormat: 'HH:mm',
  timeDisplayFormat: 'hh:mm a',
});

pinia.use(({ store }) => {
  store.$router = markRaw(adminRoutes);
});
pinia.use(({ store }) => {
  store.appType = 'admin';
});

const app = createApp(App);
app.config.globalProperties.$appType = 'admin';
app.provide('appType', 'admin');

// @appsbd/vue3-elite-grid renders its pagination text through a <translate> component from
// vue3-gettext@^2, which vue3-gettext@4 dropped. This shim renders `tag` with the default
// slot's "%{ key }" placeholders replaced from translateParams.
app.component('translate', {
  props: {
    tag: { type: String, default: 'span' },
    translateParams: { type: Object, default: () => ({}) },
  },
  setup(props, { slots }) {
    return () => {
      const raw = (slots.default ? slots.default() : [])
        .map((node) => (typeof node.children === 'string' ? node.children : ''))
        .join('')
        .trim();
      return h(props.tag, translateGetMsg(raw, props.translateParams));
    };
  },
});

app
  .use(adminRoutes)
  .use(pinia)
  .use(gettext)
  .use(AppsbdVeeRules, gettext)
  .use(ACL)
  .use(AppsbdUI)
  .use(attrOption, windowVar)
  .mount('#AppsbdAdminPanel');
