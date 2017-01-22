#!/usr/bin/python3
# -*- coding: utf-8 -*-

import os
import sys
import re
import urllib.request
import json
import zipfile
import shutil
from upstream_parser import mdi_upstream

mdi_upstream_uri = 'https://github.com/Templarian/MaterialDesign-Webfont/archive/master.zip'
mdi_workspace = 'temp'
mdi_files = [
    'css/materialdesignicons.css',
    'css/materialdesignicons.css.map',
    'css/materialdesignicons.min.css',
    'css/materialdesignicons.min.css.map',
    'fonts/materialdesignicons-webfont.eot',
    'fonts/materialdesignicons-webfont.svg',
    'fonts/materialdesignicons-webfont.ttf',
    'fonts/materialdesignicons-webfont.woff',
    'fonts/materialdesignicons-webfont.woff2'
]

meta_output_file = 'shared/data/icons.json'
meta_output_file_min = 'shared/data/icons.min.json'


def download_css_and_fonts():
    if not os.path.isdir(mdi_workspace):
        os.makedirs(mdi_workspace)

    master_filename = os.path.join(mdi_workspace, 'master.zip')
    print('Downloading {} into {}'.format(mdi_upstream_uri, master_filename))

    urllib.request.urlretrieve(mdi_upstream_uri, master_filename)

    with open(master_filename, 'rb') as file_handle:
        master_zip = zipfile.ZipFile(file_handle)
        master_zip.extractall(mdi_workspace)

    for file in mdi_files:
        zip_file = os.path.join(mdi_workspace, 'MaterialDesign-Webfont-master', file)
        output_file = os.path.join('shared/app/', file)

        shutil.copyfile(zip_file, output_file)

        print('Extracted {}'.format(file))

    shutil.rmtree(mdi_workspace)


def scan_css_selectors():
    with open('shared/app/css/materialdesignicons.css', 'r') as fh:
        raw_css = fh.read().replace('\n', '')

    return re.findall('\.mdi-([a-z-\d]*):before', raw_css)


def fetch_meta():
    upstream_meta = mdi_upstream.fetch_meta(None, True)

    if upstream_meta is None or len(upstream_meta['icons']) == 0:
        print('Could not find variables.')
        sys.exit(1)

    for icon in upstream_meta['icons']:
        # Compute searchable attribute to enhance filter performances
        searchable = ''
        for alias in [icon['name']] + icon['aliases']:
            searchable += alias.replace('-', ' ') + ' '

        # Remove last blank space from searchable
        searchable = searchable[:-1]

        icon['searchable'] = searchable

        # Remove unused information
        icon.pop('id')

    return upstream_meta


def write_meta_to_file(data, file, pretty):
    with open(file, 'w') as output:
        output.truncate()

        raw_json = json.dumps(data, sort_keys=True, indent=4 if pretty else None)
        output.writelines(raw_json)
        output.writelines("\n")

        print("Generated {} with {} variables".format(file, len(data['icons'])))


# Download CSS & fonts
download_css_and_fonts()

print('')

# Download & write meta data to files
meta = fetch_meta()
write_meta_to_file(meta, meta_output_file, True)
write_meta_to_file(meta, meta_output_file_min, False)

# Check if there are differences between css file & metadata file
css_selectors = scan_css_selectors()
meta_icons = [icon['name'] for icon in meta['icons']]
not_in_css = set(meta_icons).difference(css_selectors)
not_in_meta = set(css_selectors).difference(meta_icons)

if len(not_in_css) > 0 or len(not_in_meta) > 0:
    print('')

if len(not_in_css) > 0:
    print('Warning: these icons are missing from materialdesignicons.css:')
    for icon in sorted(not_in_css):
        print('  - {}'.format(icon))

if len(not_in_meta) > 0:
    print('Warning: these icons are missing from metadata:')
    for icon in sorted(not_in_meta):
        print('  - {}'.format(icon))
