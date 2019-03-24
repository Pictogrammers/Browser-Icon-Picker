/**
 * MaterialDesignIcons
 *
 * Builds the project, and generates release artifacts.
 */

const fs = require('fs');
const path = require('path');
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
    ELECTRON: 'Electron',
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

const readManifest = () => {
    return JSON.parse(fs.readFileSync(root+'/manifest.json'));
};

const prepareRelease = (build) => {
    console.log(chalk.blue(`Preparing release for flavour "${build}"`));

    // Open manifest and read version name
    const manifest = readManifest();
    const version = manifest.version;

    // Create release dir if it does not exist
    if (!fs.existsSync(releaseDir)) {
        fs.mkdirSync(releaseDir);
    }

    // Create final package
    const zip = new yazl.ZipFile();

    // Copy files
    for (let pattern of FILES) {
        for (let file of glob.sync(pattern)) {
            const filePath = path.resolve(root, file);

            zip.addFile(filePath, file);
        }
    }

    // Add the manifest
    // Chrome build: rewrite manifest to remove Firefox's specific nodes
    if (build === BUILDS.CHROME) {
        delete manifest.applications;
    }

    const manifestStream = new stream.Readable;
    manifestStream.push(JSON.stringify(manifest, null, 4));
    manifestStream.push(null);
    zip.addReadStream(manifestStream, 'manifest.json');
    zip.end();

    // Write ZIP to disk
    console.log('Writing ZIP file to disk...');
    console.log('');
    const zipExtension = build === BUILDS.FIREFOX ? 'xpi' : 'zip';
    const zipName = `MaterialDesignIcons-Picker-${build}-${version}.${zipExtension}`;
    zip.outputStream
        .pipe(fs.createWriteStream(releaseDir + '/' + zipName))
        .on('close', () => {
            console.log(chalk.green(`Finished build "${build}" (${zipName}) ✔`));
        });
};

/**
 * Firefox review process requires a ZIP archive containing project
 * sources. This function generates a copy of this project, containing only the necessary files.
 */
const prepareFirefoxReviewZip = () => {
    console.log(chalk.blue(`Preparing Firefox review ZIP file`));

    const files = [
        '*',
        'dist/**/*',
        'doc/*',
        'src/**/*',
        'tools/**/*',
    ];

    const zip = new yazl.ZipFile();

    // Copy files
    for (let pattern of files) {
        for (let file of glob.sync(pattern)) {
            const filePath = path.resolve(root, file);

            // Check if it's really a file: '*' pattern matches directories too
            const stat = fs.lstatSync(filePath);
            if (stat.isFile()) {
                zip.addFile(filePath, file);
            }
        }
    }

    zip.end();

    // Write ZIP to disk
    console.log('Writing ZIP file to disk...');
    console.log('');
    const version = readManifest().version;
    const zipName = `MaterialDesignIcons-Picker-Firefox-Review-${version}.zip`;
    zip.outputStream
        .pipe(fs.createWriteStream(releaseDir + '/' + zipName))
        .on('close', () => {
            console.log(chalk.green(`${zipName} is ready ✔`));
        });
};

/* DO THE THING */
console.log(chalk.blue.bold('MaterialDesignIcons release bundler 🚀'));

console.log(`Building project using webpack...`);
try {
    execSync('yarn run build');
} catch (error) {
    console.log(chalk.blue.red('Build failed:'));
    console.log(error);
    return;
}
console.log('');

for (const build of Object.keys(BUILDS)) {
    prepareRelease(BUILDS[build]);
}

prepareFirefoxReviewZip();
