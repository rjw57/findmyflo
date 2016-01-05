#!/usr/bin/env python
"""
Download and process latest FLO list.

Usage:
    extractflolist.py (-h, --help)
    extractflolist.py <output>

Options:
    -h, --help      Show a brief usage summary.

The <output> argument names a file which a filtered version of
https://finds.org.uk/contacts/index/index/format/json is written to.

"""
import json

import docopt
import pyproj
import requests

FLO_LIST_URL = 'https://finds.org.uk/contacts/index/index/format/json'
FLO_ROLE = 'Finds Liaison Officer'

BNG = pyproj.Proj(init='epsg:27700')
WGS84 = pyproj.Proj(init='epsg:4326')

def process_staff(record):
    """Augment a staff record with an easting and northing."""
    lng, lat = record.get('longitude'), record.get('latitude')

    if lng is None or lat is None:
        # No co-ord to process
        return record

    easting, northing = pyproj.transform(WGS84, BNG, lng, lat)[:2]
    new_record = {'easting': int(easting), 'northing': int(northing)}

    new_record.update(record)
    return new_record

def main():
    opts = docopt.docopt(__doc__)

    # Fetch latest FLO list
    flo_list = requests.get(FLO_LIST_URL).json()

    # Filter staff list
    current_staff = flo_list.get('currentStaff', [])
    flo_list['currentStaff'] = [
        process_staff(r) for r in current_staff if r['staffroles'] == FLO_ROLE
    ]

    # Write output
    with open(opts['<output>'], 'w') as fobj:
        json.dump(flo_list, fobj)

if __name__ == '__main__':
    main()
