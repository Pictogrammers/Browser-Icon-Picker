/**
 * MaterialDesignIcons-Picker
 * Browser action script
 */

// CSS
require('./css/style.scss');

// Dependencies
import Vue from 'vue';
import IconsPicker from 'vue-icons-picker';

// Init VueJs component
new Vue({
    el: '#app',
    render: h => h(IconsPicker, {
        props: {
            config: {
                name: 'MaterialDesignIcons',
                classPrefix: 'mdi',
                repoUrl: 'https://github.com/chteuchteu/MaterialDesignIcons-Picker',

                icons: {
                    main: 'mdi mdi-vector-square',
                    loading: 'mdi mdi-cached',
                    close: 'mdi mdi-close',
                    openExternal: 'mdi mdi-open-in-new',
                    random: 'mdi mdi-shuffle',
                    randomColors: 'mdi mdi-invert-colors',
                    svg: 'mdi mdi-xml',
                    download: 'mdi mdi-download',
                    madeBy: 'mdi mdi-heart',
                    gitHub: 'mdi mdi-github-circle'
                },

                openText: 'Open MaterialDesignIcons.com',
                openUrl: 'https://materialdesignicons.com',
                openIconText: 'Open {icon} in MaterialDesignIcons.com',
                openIconUrl: 'https://materialdesignicons.com/icon/{icon}',

                enableSvgFeatures: true,
            }
        }
    })
});
