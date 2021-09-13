/**
 * MaterialDesignIcons-Picker
 * Browser action script
 */

import { createApp } from 'vue'
import App from './App.vue'

require('./css/style.scss');

createApp(App).mount('#app', process.env.NODE_ENV === 'production')
