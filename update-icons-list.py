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
mdi_svg_upstream_uri = 'https://github.com/Templarian/MaterialDesign-SVG/archive/master.zip'
mdi_workspace = 'temp'
mdi_files = [
    'css/materialdesignicons.css',
    'css/materialdesignicons.css.map',
    'css/materialdesignicons.min.css',
    'css/materialdesignicons.min.css.map',
    'fonts/materialdesignicons-webfont.woff2'
]

meta_output_file = 'dist/data/icons.json'
meta_output_file_min = 'dist/data/icons.min.json'
svg_output_file = 'dist/data/icons-svg.json'
svg_output_file_min = 'dist/data/icons-svg.min.json'


def download_and_extract(url):
    if not os.path.isdir(mdi_workspace):
        os.makedirs(mdi_workspace)

    master_filename = os.path.join(mdi_workspace, 'master.zip')
    print('Downloading {} into {}'.format(url, master_filename))

    urllib.request.urlretrieve(url, master_filename)

    with open(master_filename, 'rb') as file_handle:
        master_zip = zipfile.ZipFile(file_handle)
        master_zip.extractall(mdi_workspace)


def download_css_and_fonts():
    # download main repo content
    download_and_extract(mdi_upstream_uri)

    # copy only certain files
    for file in mdi_files:
        zip_file = os.path.join(mdi_workspace, 'MaterialDesign-Webfont-master', file)
        output_file = os.path.join('dist/', file)

        shutil.copyfile(zip_file, output_file)

        print('Extracted {}'.format(file))

    # cleanup
    shutil.rmtree(mdi_workspace)


def download_svg():
    icons_svg = {}

    download_and_extract(mdi_svg_upstream_uri)

    # read each svg file
    svg_files_path = os.path.join(mdi_workspace, 'MaterialDesign-SVG-master', 'svg')
    for file in os.listdir(svg_files_path):
        icon_svg = open(os.path.join(svg_files_path, file), 'r').read()

        # fine-tune SVG:
        # remove xml header
        icon_svg = icon_svg.replace('<?xml version=\"1.0\" encoding=\"UTF-8\"?><!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">', '')
        # remove xmlns & xmlns:xlink & version attributes
        icon_svg = icon_svg.replace(' xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\"', '')

        icons_svg[file.replace('.svg', '')] = icon_svg

    # write icons to file
    write_json_to_file(icons_svg, svg_output_file, True)
    write_json_to_file(icons_svg, svg_output_file_min, False)

    # cleanup
    shutil.rmtree(mdi_workspace)


def scan_css_selectors():
    with open('dist/css/materialdesignicons.css', 'r') as fh:
        raw_css = fh.read().replace('\n', '')

    return re.findall('\.mdi-([a-z-\d]*):before', raw_css)


def fetch_meta():
    upstream_meta = mdi_upstream.fetch_meta(None, True)

    if upstream_meta is None or len(upstream_meta['icons']) == 0:
        print('Could not find variables.')
        sys.exit(1)

    for icon in upstream_meta['icons']:
        # Compute searchable attribute to enhance filter performances
        searchable = []
        for expr in icon['name'].split('-') + icon['aliases'] + icon['tags']:
            if expr not in searchable:
                searchable.append(expr.lower())

        str_searchable = ' '.join(searchable)

        # Remove duplicate words
        searchable = str_searchable.split()
        icon['searchable'] = ' '.join(sorted(set(searchable), key=searchable.index))

        # Remove unused information
        icon.pop('id')
        icon.pop('tags')
        icon.pop('aliases')

    return upstream_meta


def write_json_to_file(data, file, pretty):
    with open(file, 'w') as output:
        output.truncate()

        raw_json = json.dumps(data, sort_keys=True, indent=4 if pretty else None)
        output.writelines(raw_json)
        output.writelines("\n")

        print("Written {}".format(file))


# Download CSS & fonts
download_css_and_fonts()

# Download & read SVG
download_svg()

print('')

# Download & write meta data to files
meta = fetch_meta()
print("Found {} icons".format(len(meta['icons'])))
write_json_to_file(meta, meta_output_file, True)
write_json_to_file(meta, meta_output_file_min, False)

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
