/**
 * MaterialDesignIcons
 *
 * Builds the project, and generates release artifacts.
 */

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const glob = require('glob');
const chalk = require('chalk');
const yazl = require('yazl');
const stream = require('stream');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..'),
    releaseDir = path.resolve(root, 'release');

const BUILDS = {
    FIREFOX: 'Firefox',
    CHROME: 'Chrome',
};

const FILES = [
    'dist/app.js',
    'dist/index.html',
    'dist/main.css',
    'dist/css/*',
    'dist/fonts/*',
    'dist/img/*',
    'dist/data/icons.min.json',
    'dist/data/svg/*',
];

const prepareRelease = async (build) => {
    console.log(chalk.blue(`Preparing release for flavour "${build}"`));

    // Open manifest and read version name
    const manifest = JSON.parse(fs.readFileSync(root+'/manifest.json'));
    const version = manifest.version;

    // Create release dir if it does not exist
    if (!fs.existsSync(releaseDir)) {
        fs.mkdirSync(releaseDir);
    }

    // Create final package
    const zip = new yazl.ZipFile();

    // Copy files
    for (let pattern of FILES) {
        console.log(` - Adding ${pattern} to ZIP archive`);

        for (let file of glob.sync(pattern)) {
            const filePath = path.resolve(root, file);

            zip.addFile(filePath, file);
        }
    }

    // Add the manifest
    // With Chrome build: rewrite manifest to remove Firefox's specific nodes
    if (build === BUILDS.CHROME) {
        console.log(' - Updating manifest.json...');
        delete manifest.applications;
    }

    console.log(` - Adding manifest.json to ZIP archive`);
    const manifestStream = new stream.Readable;
    manifestStream.push(JSON.stringify(manifest, null, 4));
    manifestStream.push(null);
    zip.addReadStream(manifestStream, 'manifest.json');
    zip.end();

    // Write ZIP to disk
    console.log('Writing ZIP file to disk...');
    const zipExtension = build === BUILDS.FIREFOX ? 'xpi' : 'zip';
    const zipName = `MaterialDesignIcons-Picker-${build}-${version}.${zipExtension}`;
    zip.outputStream
        .pipe(fs.createWriteStream(releaseDir + '/' + zipName))
        .on("close", function() {
            console.log(chalk.green(`Finished build "${build}" (${zipName}) ✔`));
        });
};

/* DO THE THING */
console.log(chalk.blue.bold('MaterialDesignIcons release bundler 🚀'));

console.log(`Building project using webpack...`);
try {
    console.log(execSync('yarn run build'));
} catch (error) {
    console.log(chalk.blue.red('Build failed:'));
    console.log(error);
    return;
}

for (const build of Object.keys(BUILDS)) {
    prepareRelease(BUILDS[build]);
}
