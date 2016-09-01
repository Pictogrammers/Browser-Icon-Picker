/**
 * MaterialDesignIcons-Picker
 * Electron-specific code
 */

(function() {
    var assignTitlebarListeners = function() {
        if (window.picker.flavor != Flavor.Electron)
            return;

        // Assign events to minimize, maximize & close buttons
        // Inspired by http://stackoverflow.com/questions/31171597/atom-electron-close-the-window-with-javascript
        const remote = require('electron').remote;
        var w = remote.getCurrentWindow();

        $('#win-min').click(function () {
            w.minimize();
        });

        $('#win-max').click(function () {
            if (!w.isMaximized())
                w.maximize();
            else
                w.unmaximize();
        });

        $('#win-clo').click(function () {
            w.close();
        });
    };
    $(document).ready(assignTitlebarListeners);
})();
