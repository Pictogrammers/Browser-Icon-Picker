# MaterialDesignIcons-Picker
*A cute [MaterialDesignIcons](https://materialdesignicons.com) icon picker for your web browser*

[![Download on Chrome Web Store](doc/download-chrome-web-store.png)](https://chrome.google.com/webstore/detail/materialdesignicons-picke/edjaedpifkihpjkcgknfokmibkoafhme)
[![Download for Firefox](doc/download-firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/materialdesignicons-picker/)

![MaterialDesignIcons-Picker](doc/screenshot.png)

## Development

```bash
# Install dependencies
yarn install

# Run
yarn run start
```

Once started, open your browser on `http://127.0.0.1:8080`!

## Release

Run `update-icons-list.js` to get the latest icons, and `prepare-release.js` to build, tag & pack a new version.

```bash
nodejs tools/update-icons-list.js
nodejs tools/prepare-release.js
```

Your generated artifacts will be outputed in a release/ subdirectory.
