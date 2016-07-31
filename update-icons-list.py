#!/usr/bin/python3
# -*- coding: utf-8 -*-

import os
import sys
import urllib.request
import re
import json
import zipfile
import shutil

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
meta_variables_upstream_uri = 'https://raw.githubusercontent.com/Templarian/MaterialDesign-Webfont/master/scss/_variables.scss'
meta_upstream_uri = 'http://cdn.materialdesignicons.com/1.5.54/meta.json'  # TODO: replace this with latest meta.json
meta_output_file = 'data/browser-action/js/icons.js'
meta_output_file_min = 'data/browser-action/js/icons.min.js'
meta_output_header = "window.MaterialDesignIcons = "
meta_output_footer = ";\n"


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


def get_mdi_version():
    # Download & parse upstream meta file
    response = urllib.request.urlopen(meta_variables_upstream_uri)
    _variables = response.read().decode('utf-8')

    version_regex = re.compile('\$mdi-version:\s*"(.*)" *')
    version_matches = version_regex.findall(_variables)
    return version_matches[0]


def fetch_meta():
    # Download & parse upstream meta file
    response = urllib.request.urlopen(meta_upstream_uri)
    icons = json.loads(response.read().decode('utf-8'))
    mdi_version = get_mdi_version()

    if len(icons) == 0:
        print('Could not find variables.')
        sys.exit(1)

    data = {
        'version': mdi_version,
        'icons': []
    }
    for icon in icons:
        # Compute searchable attribute to enhance filter performances
        searchable = ''
        for alias in [icon['name']] + icon['aliases']:
            searchable += alias.replace('-', ' ') + ' '

        # Remove last blank space from searchable
        searchable = searchable[:-1]

        data['icons'].append({
            'name': icon['name'],
            'aliases': icon['aliases'],
            'codepoint': icon['codepoint'],
            'version': mdi_version,
            'author': 'unknown',  # icon['author'], TODO
            'searchable': searchable
        })

    return data


def write_meta_to_file(data, file, pretty):
    with open(file, 'w') as output:
        output.truncate()

        output.writelines(meta_output_header)
        raw_json = json.dumps(data, sort_keys=True, indent=4 if pretty else None)
        output.writelines(raw_json)
        output.writelines(meta_output_footer)

        print("Generated {} with {} variables".format(file, len(data['icons'])))


# Download CSS & fonts
download_css_and_fonts()

print('')

# Download & write meta data to files
meta = fetch_meta()
write_meta_to_file(meta, meta_output_file, True)
write_meta_to_file(meta, meta_output_file_min, False)
