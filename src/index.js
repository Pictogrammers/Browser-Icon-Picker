/**
 * MaterialDesignIcons-Picker
 * Browser action script
 */

// CSS
require('./css/style.scss');

// Dependencies
import Vue from 'vue';
import App from './vue/App.vue';

// Init VueJs component
new Vue({
    el: '#app',
    render: h => h(App)
});
