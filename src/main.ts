/**
 * MaterialDesignIcons-Picker
 * Browser action script
 */

import { createApp } from 'vue'
import App from './App.vue'

require('./css/style.scss');

const init = () => createApp(App).mount('#app', process.env.NODE_ENV === 'production');
if (window.requestIdleCallback) {
  window.requestIdleCallback(init, {
    timeout: 1000,
  });
} else {
  init();
}
