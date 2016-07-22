#!/usr/bin/python3
# -*- coding: utf-8 -*-

import sys
import urllib.request
import re

icon_prefix = 'mdi-'
input_file_uri = 'https://raw.githubusercontent.com/Templarian/MaterialDesign-Webfont/master/scss/_variables.scss'
output_file = 'data/browser-action/js/icons.js'
output_header = "window.MaterialDesignIcons = [\n"
output_footer = "];\n"

# Download & parse input file
response = urllib.request.urlopen(input_file_uri)
data = response.read()
input = data.decode('utf-8')

regex = re.compile('    "(.*)": (F[A-F0-9]*),?')
matches = regex.findall(input)

if len(matches) == 0:
    print('Could not find variables.')
    sys.exit(1)

# Write in generated file
with open(output_file, 'w') as output:
    output.truncate()

    output.writelines(output_header)

    for match in matches:
        icon_name = match[0]
        comma = matches.index(match) != len(matches)-1

        output.write('    \'{}\'{}\n'.format(icon_prefix + icon_name, ',' if comma else ''))

    output.writelines(output_footer)

    print("Generated {} with {} variables".format(output_file, len(matches)))
