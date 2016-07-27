#!/usr/bin/python3
# -*- coding: utf-8 -*-

import sys
import urllib.request
import re
import json


def write_to_file(file, pretty):
    with open(file, 'w') as output:
        output.truncate()

        output.writelines(output_header)
        raw_json = json.dumps(data, sort_keys=True, indent=4) if pretty else json.dumps(data)
        output.writelines(raw_json)
        output.writelines(output_footer)

        print("Generated {} with {} variables".format(file, len(icons_matches)))


upstream_uri = 'https://raw.githubusercontent.com/Templarian/MaterialDesign-Webfont/master/scss/_variables.scss'
output_file = 'data/browser-action/js/icons.js'
output_file_min = 'data/browser-action/js/icons.min.js'
output_header = "window.MaterialDesignIcons = "
output_footer = ";\n"

# Download & parse input file
response = urllib.request.urlopen(upstream_uri)
_variables = response.read().decode('utf-8')

icons_regex = re.compile('    "(.*)": (F[A-F0-9]*),?')
icons_matches = icons_regex.findall(_variables)

version_regex = re.compile('\$mdi-version:\s*"(.*)" *')
version_matches = version_regex.findall(_variables)
version = version_matches[0]

if len(icons_matches) == 0:
    print('Could not find variables.')
    sys.exit(1)

data = {
    'version': version,
    'icons': []
}
for match in icons_matches:
    icon_name = match[0]

    data['icons'].append({
        'name': icon_name,
        'aliases': []
    })

write_to_file(output_file, True)
write_to_file(output_file_min, False)
