/**
 * MaterialDesignIcons-Picker
 * Electron entry point
 */

import { initApp } from './js/app';

const { shell, remote } = require('electron');

// Register click events to handle target="_blank" links:
// we don't want them opened in electron
document.body.onclick = (e) => {
    if (e.target.tagName.toLowerCase() === 'a' && e.target.target === '_blank') {
        shell.openExternal(e.target.href);

        return false;
    }
};

initApp({
    isElectron: true,
    electronBus: {
        openExternal: (url) => shell.openExternal(url),
        window: {
            minimize: () => remote.getCurrentWindow().minimize(),
            maximize: () => {
                const w = remote.getCurrentWindow();
                if (w.isMaximized()) {
                    w.unmaximize();
                }
                else {
                    w.maximize();
                }
            },
            close: () => remote.getCurrentWindow().close(),
        }
    },
});
