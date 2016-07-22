#!/usr/bin/python3
# -*- coding: utf-8 -*-

import argparse
import sys
import os
import glob
import shutil
import json
import zipfile


release_dir = 'release/'
base_dir = os.path.dirname(os.path.realpath(__file__))
flavours = ['Chrome', 'Firefox']
files_generic = [
    'data/browser-action/css/materialdesignicons.min.css',
    'data/browser-action/css/materialdesignicons.min.css.map',
    'data/browser-action/css/style.css',
    'data/browser-action/fonts/*',
    'data/browser-action/js/script.js',
    'data/browser-action/vendor/jquery-2.2.3.min.js',
    'data/browser-action/index.html',

    'data/img/icon-*x*.png',

    'manifest.json'
]
manifest = 'manifest.json'


def do_release(flavour):
    # Open manifest & read version name
    with open(manifest) as manifest_file:
        manifest_json = json.load(manifest_file)
    version = manifest_json['version']
    output_dir_name = 'MaterialDesignIcons-Picker-{}-{}'.format(flavour, version)
    output_dir = os.path.join(release_dir, output_dir_name)

    # Expand files list (js/* => [js/content-script.js, js/injector.js]
    expanded_files = []
    files = files_generic
    for file in files:
        if file.endswith('/*'):  # That's a directory: include all its elements
            real_name = file[:-1]
            expanded_files.extend(
                [os.path.join(dp, f) for dp, dn, filenames in os.walk(real_name) for f in filenames]
            )
        elif '*' in file:  # Find all files matching this pattern
            expanded_files.extend(
                glob.glob(file)
            )
        else:
            expanded_files.append(file)

    # Copy these!
    print('Copying resources in {}...'.format(output_dir))
    for file in expanded_files:
        destination = os.path.join(output_dir, file)
        destination_dirs = os.path.dirname(destination)

        if not os.path.isdir(destination_dirs):
            os.makedirs(destination_dirs)

        shutil.copy(file, destination)
        print('\tCopied {}'.format(file, destination))

    # With Chrome flavour: rewrite manifest to remove Firefox's specific nodes
    if flavour == 'Chrome':
        with open(os.path.join(output_dir, manifest), 'w') as output_manifest_file:
            del manifest_json['applications']
            json.dump(manifest_json, output_manifest_file)

    # Create final ZIP package
    zip_extension = 'xpi' if flavour == 'Firefox' else 'zip'
    zip_name = 'MaterialDesignIcons-Picker-{}-{}.{}'.format(flavour, version, zip_extension)

    with zipfile.ZipFile(os.path.join(release_dir, zip_name), 'w') as zip:
        print('Creating package {}'.format(zip_name))

        for root, dirs, files in os.walk(output_dir):
            for file in files:
                zip_filepath = os.path.relpath(os.path.join(root, file), output_dir)
                zip.write(os.path.join(root, file), zip_filepath)

                print('\tAdded {}'.format(zip_filepath))

    # Note: ignore_errors=True allows us to ignore "directory is not empty" errors on Windows
    shutil.rmtree(output_dir, ignore_errors=True)
    print('Deleted working directory {}'.format(output_dir))

    print('Release file {} created for flavour {}'.format(zip_name, flavour))


parser = argparse.ArgumentParser(description='Prepare release packages for different flavours')
parser.add_argument('--flavour')
args = parser.parse_args()
flavour = args.flavour

if flavour is None:
    print('Please specify a flavour using --flavour')
    sys.exit(1)
elif flavour != 'all' and flavour not in flavours:
    print('Unknown flavour, exiting')
    sys.exit(1)

# Create output dir if necessary
if not os.path.isdir(release_dir):
    print('Creating output dir')
    os.makedirs(release_dir)

if flavour == 'all':
    for flavour in flavours:
        do_release(flavour)
else:
    do_release(flavour)
