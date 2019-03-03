/**
 * App initialization
 * Called from either index-web.js or index-electron.js
 */

// CSS
require('../css/style.scss');

// Dependencies
import Vue from 'vue';
import IconsPicker from './vue/IconsPicker.vue';

export const initApp = (props) => {
    // Init VueJs component
    new Vue({
        el: '#app',
        render: h => h(IconsPicker, {
            props: props,
        }),
    });
};
