/**
 * MaterialDesignIcons
 *
 * Downloads latest MDI & MDI light releases and extracts the right resources
 * in the right folder.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const rimraf = require('rimraf');
const upstream = require('./lib/upstream');

const log = console.log;
const workspace = path.resolve(__dirname, '../temp');
const dist = path.resolve(__dirname, '../dist');

const downloadLatestIcons = async () => {
    log(chalk.blue.bold('MaterialDesignIcons icons parser🔍'));

    // Check current version
    const iconsJsonPath = dist + '/data/icons.json';
    const oldVersions = fs.existsSync(iconsJsonPath) ? JSON.parse(fs.readFileSync(iconsJsonPath)).version : null;

    // Create structure: temp directory & dist dir
    const dirs = [
        workspace,
        dist + '/css/',
        dist + '/fonts/',
        dist + '/data/',
        dist + '/data/svg/',
    ];
    for (let directory of dirs) {
        // Remove it if exists
        if (fs.existsSync(directory)) {
            rimraf.sync(directory);
        }

        // Re-create it
        fs.mkdirSync(directory);
    }

    let data = {
        icons: {
            default: [],
            light: [],
        },
        version: {
            default: [],
            light: [],
        },
    };

    for (let flavour of ['default', 'light']) {
        log(chalk.blue(`Handling flavour "${flavour}" 🔍`));

        // Get the latest version available
        const version = data.version[flavour] = await upstream.getLatestVersion(flavour);
        log(`Latest version: ${chalk.underline(version)} ✔️`);

        // Download CSS file (in dist/css/), woff2 webfont (in dist/fonts/)
        const webfontZipPath = `${workspace}/${flavour}-webfont.zip`;
        const webfontExtractedZipPath = `${workspace}/${flavour}-webfont`;
        fs.mkdirSync(webfontExtractedZipPath);
        await upstream.downloadWebfontZip(webfontZipPath, flavour);
        log(`Downloaded webfont ZIP ✔️`);
        await upstream.extractZip(webfontZipPath, webfontExtractedZipPath, /^MaterialDesign(Light)?-Webfont-master\/(css\/materialdesignicons(-light)?\.min\.css|fonts\/materialdesignicons(-light)?-webfont\.woff2)$/);
        log(`Extracted webfont ZIP ✔️`);
        // Copy files
        fs.copyFileSync(`${webfontExtractedZipPath}/materialdesignicons${flavour === 'light' ? '-light': ''}.min.css`, `${dist}/css/materialdesignicons${flavour === 'light' ? '-light': ''}.min.css`);
        fs.copyFileSync(`${webfontExtractedZipPath}/materialdesignicons${flavour === 'light' ? '-light': ''}-webfont.woff2`, `${dist}/fonts/materialdesignicons${flavour === 'light' ? '-light': ''}-webfont.woff2`);

        // Download SVG files
        const svgZipPath = `${workspace}/${flavour}-svg.zip`;
        const svgExtractedZipPath = `${workspace}/${flavour}-svg`;
        fs.mkdirSync(svgExtractedZipPath);
        await upstream.downloadSvgZip(svgZipPath, flavour);
        log(`Downloaded SVG ZIP ✔️`);
        await upstream.extractZip(svgZipPath, svgExtractedZipPath, /^MaterialDesign(Light)?-SVG-master\/svg\/.+$/);
        log(`Extracted SVG ZIP ✔️`);

        const iconsMetas = await upstream.getMeta(version, flavour);
        log(`Downloaded meta file ✔️`);

        for (let icon of iconsMetas) {
            // Get svg, fine-tune it
            let svg = fs.readFileSync(`${svgExtractedZipPath}/${icon.name}.svg`, 'utf-8');

            // Remove xml header
            svg = svg.replace('<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">', '');
            // Remove xmlns & xmlns:xlink & version attributes
            svg = svg.replace(' xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\"', '');
            // Remove id="{icon_name}" attribute
            svg = svg.replace(` id=\"mdi-${icon.name}\"`, '');

            fs.writeFileSync(`${dist}/data/svg/${icon.id}.svg`, svg);

            // Compute "searchable" attribute
            let searchable = '';
            for (let part of [icon.name, ...icon.aliases, ...icon.tags]) {
                searchable += part
                    .split('/').join(' ') // remove "/"
                    .split('-').join(' ') // remove "-"
                    .split('  ').join(' ') // replace multiple spaces
                    .toLowerCase()
            }
            searchable = Array.from(new Set(searchable.split(' '))).join(' ');

            data.icons[flavour].push({
                id: icon.id,
                name: icon.name,
                author: icon.author,
                codepoint: icon.codepoint,
                searchable: searchable,
                version: icon.version,
                styles: [
                    flavour, // 'light' or 'default'
                    icon.name.includes('outline') || flavour === 'light' ? 'outline' : 'filled', // 'outline' or 'filled'
                ],
                class: flavour === 'default'
                    ? 'mdi mdi-'+icon.name
                    : 'mdil mdil-'+icon.name,
            });
        }

        // Sort our icons list
        data.icons[flavour].sort((a, b) => a.name.localeCompare(b.name));

        log('');
    }

    // Dump to file
    log('Writing JSON files...');
    fs.writeFileSync(`${dist}/data/icons.json`, JSON.stringify(data, null, 4));
    fs.writeFileSync(`${dist}/data/icons.min.json`, JSON.stringify(data));
    log(chalk.green(`Done! ✔`));

    // Clean
    rimraf.sync(workspace);

    // Report
    const newVersions = JSON.parse(fs.readFileSync(iconsJsonPath)).version;
    if (oldVersions !== null && (oldVersions.default !== newVersions.default || oldVersions.light !== newVersions.light)) {
        log(chalk.green.bold(`Icons has been updated, please prepare a release!`));
    }
    log(`Default flavour: ${oldVersions.default} -> ${newVersions.default}`);
    log(`Light flavour: ${oldVersions.light} -> ${newVersions.light}`);
};

downloadLatestIcons();
