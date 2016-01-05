#!/usr/bin/env python
"""
Merge multiple JSON objects together.

Usage:
    mergejson.py (-h | --help)
    mergejson.py <output> [<input>...]

Options:
    -h, --help      Show a brief usage summary.

The JSON objects in the files listed as <input> are merged and written to
<output>.

"""
import json

import docopt

def main():
    opts = docopt.docopt(__doc__)

    output = {}
    for fn in opts['<input>']:
        with open(fn) as fobj:
            output.update(json.load(fobj))

    with open(opts['<output>'], 'w') as fobj:
        json.dump(output, fobj)

if __name__ == '__main__':
    main()
