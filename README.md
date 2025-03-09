# Material Design Icons Picker
*A cute [Material Design Icons](https://pictogrammers.com/library/mdi) icon picker for your web browser*

[![Download on Chrome Web Store](doc/download-chrome-web-store.png)](https://chrome.google.com/webstore/detail/materialdesignicons-picke/edjaedpifkihpjkcgknfokmibkoafhme)
[![Download for Firefox](doc/download-firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/materialdesignicons-picker/)
[![Download for Edge](doc/download-edge.png)](https://microsoftedge.microsoft.com/addons/detail/materialdesignicons-picke/iinekiifciemnoaeehkaoplmopafhiba)

| ![MaterialDesignIcons-Picker](doc/screenshot-dark.png) | ![MaterialDesignIcons-Picker](doc/screenshot-light.png) |
|:---:|:---:|

## Development

```bash
# Clone the project
git clone git@github.com:Pictogrammers/Browser-Icon-Picker.git && cd Browser-Icon-Picker

# Switch to the right node & npm version
nvm use

# Install dependencies
npm install

# Pull icons
node ./tools/pull-icons.js

# Run
npm serve
# Once started, open your browser on `http://127.0.0.1:8080`!

# Compiles and minifies for production
npm build

# Lints and fixes files
npm lint
```

## Release

1. Check latest published version [from npm registry](https://www.npmjs.com/package/@mdi/font)
2. Update version in [package.json](./package.json): `materialdesignicons-picker.version.default`
3. Pull the icons:
    ```bash
    node tools/pull-icons.js
    ```
4. Tag a release & pack a new version:
    ```bash
    node tools/prepare-release.js
    ```

Your generated artifacts are ready in the `release/` subdirectory.

<p align="center">
<small>Chrome is a trademark of Google Inc. Edge's download button by Julien Muggli.</small>
</p>
