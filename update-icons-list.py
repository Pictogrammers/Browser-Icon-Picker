#!/usr/bin/python3
# -*- coding: utf-8 -*-

import os
import sys
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

meta_output_file = 'data/icons.json'
meta_output_file_min = 'data/icons.min.json'


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
        output_file = os.path.join('data/browser-action/', file)

        shutil.copyfile(zip_file, output_file)

        print('Extracted {}'.format(file))

    shutil.rmtree(mdi_workspace)


def fetch_icons_list():
    # Download & parse upstream meta file
    meta = mdi_upstream.fetch_meta()

    if meta is None or len(meta['icons']) == 0:
        print('Could not find variables.')
        sys.exit(1)

    data = {
        'version': meta['version'],
        'icons': []
    }
    for icon in meta['icons']:
        icon_name = icon['name']
        aliases = []

        # Compute searchable attribute to enhance filter performances
        searchable = icon_name.replace('-', ' ')
        for alias in aliases:
            searchable += ' ' + alias.replace('-', ' ')

        data['icons'].append({
            'name': icon_name,
            'aliases': aliases,
            'searchable': searchable
        })

    return data


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
meta = fetch_icons_list()
write_meta_to_file(meta, meta_output_file, True)
write_meta_to_file(meta, meta_output_file_min, False)
