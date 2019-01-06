/**
 * MaterialDesignIcons-Picker
 * Browser action script
 */

// CSS
require('./css/style.scss');

// Dependencies
import Vue from 'vue';

import IconsPicker from './js/vue/IconsPicker.vue';

// Init VueJs component
new Vue({
    el: '#app',
    render: h => h(IconsPicker)
});
