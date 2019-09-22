/**
 * MaterialDesignIcons-Picker
 * open-pr-on-new-mdi-version workflow
 *
 * Checks
 *  - if a newer version of the MDI library is available (either default or light flavour),
 *  - if an existing PR hasn't been opened yet
 *
 * then
 *
 *  - updates package.json with the right version numbers
 *  - outputs necessary information in order to open a new PR
 */
const fs = require('fs');
const path = require('path');
const core = require('@actions/core');
const github = require('@actions/github');
const upstream = require('./../../lib/upstream');

const projectRoot = path.resolve(__dirname, '../../..');

const getPullRequestTitle = (upstreamVersions) => `Upgrade MDI version (default: ${upstreamVersions.default}, light: ${upstreamVersions.light})`;

const preparePr = async () => {
    // Check latest versions
    const upstreamVersions = {
        default: await upstream.getLatestVersion('default'),
        light: await upstream.getLatestVersion('light'),
    };
    core.info(`Found upstream versions default=${upstreamVersions.default}, light=${upstreamVersions.light}`);

    // Compare with locally installed versions
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = fs.readFileSync(packageJsonPath,'utf8');
    const jsonPackageJson = JSON.parse(packageJson);
    const localVersions = jsonPackageJson['materialdesignicons-picker'].version;
    core.info(`Found local versions default=${localVersions.default}, light=${localVersions.light}`);

    // Abort if same
    if (upstreamVersions.default === localVersions.default && upstreamVersions.light === localVersions.light) {
        core.info('No difference found in versions, aborting!');
        core.setOutput('proceed', 'no');
        return;
    }

    // Check if a PR already exists
    const octokit = new github.GitHub(process.env.REPO_ACCESS_TOKEN);
    const context = github.context;
    const { data: pullRequests } = await octokit.pulls.list({
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: 'open',
        sort: 'created',
        direction: 'desc',
    });
    core.info(`Found ${pullRequests.length} PRs: `+pullRequests.map(pr => `"${pr.title}"`).join(', '));
    // Find the one with the right title
    const prTitle = getPullRequestTitle(upstreamVersions);
    const pullRequest = pullRequests.find((pr) => pr.title === prTitle);
    if (pullRequest) {
        core.info(`A pull request named "${prTitle}" already exists!`);
        core.setOutput('proceed', 'no');
        return;
    }
    core.info(`No pull request named "${prTitle}", let's proceed!`);

    // Update version in package.json
    let newPackageJson = packageJson;
    newPackageJson = newPackageJson.replace(/"default": ".*",/, `"default": "${upstreamVersions.default}",`);
    newPackageJson = newPackageJson.replace(/"light": ".*"/, `"light": "${upstreamVersions.light}"`);
    fs.writeFileSync(packageJsonPath, newPackageJson);
    core.info('Updated package.json with upstream version numbers');

    // Export PR information
    core.setOutput('mdi_upstream_default', upstreamVersions.default);
    core.setOutput('mdi_upstream_light', upstreamVersions.light);
    core.setOutput('mdi_local_default', localVersions.default);
    core.setOutput('mdi_local_light', localVersions.light);
    core.setOutput('proceed', 'yes');
};

preparePr().catch((error) => core.setFailed(error.message));
