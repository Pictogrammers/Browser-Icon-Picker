/**
 * MaterialDesignIcons-Picker
 * Browser action script
 */

import { createApp } from 'vue'
import App from './App.vue'
import VueVirtualScroller from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'

require('./css/style.scss');

const init = () => {
  const app = createApp(App);
  app.use(VueVirtualScroller);
  app.mount('#app', process.env.NODE_ENV === 'production')
};
if (window.requestIdleCallback) {
  window.requestIdleCallback(init, {
    timeout: 1000,
  });
} else {
  init();
}
