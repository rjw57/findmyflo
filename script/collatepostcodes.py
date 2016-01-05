#!/usr/bin/env python
"""
Process OS Code-Point Open CSV data into {east,north}ings for Postcode Districts.

Usage:
    collatepostcodes.py (-h | --help)
    collatepostcodes.py <dir> <output>

Options:
    -h, --help      Show a breif usage summary.

The <dir> argument should be the "Data/CSV" directory extracted from the OS
Code-Point Open dataset available at:

    https://www.ordnancesurvey.co.uk/business-and-government/products/code-point-open.html

The <output> argument names a file to which the processed data should be written
in JSON format.

"""
import csv
import glob
import json
import os
import sys

import docopt

def main():
    opts = docopt.docopt(__doc__)
    csv_files = glob.glob(os.path.join(opts['<dir>'], '*.csv'))
    if len(csv_files) == 0:
        print('No files found in directory "{}".'.format(opts['<dir>']),
              file=sys.stderr)
        sys.exit(1)

    # Dict mapping postcode districts to easting, northing, sample count triples.
    districts = {}

    for csv_fn in csv_files:
        with open(csv_fn) as fobj:
            update_districts_from_file(fobj, districts)

    # Convert district map to list of records
    records = []
    for district, (easting, northing, _) in districts.items():
        records.append((district, int(easting), int(northing)))

    # Sort records by district
    records.sort(key=lambda r: r[0])

    # Write output
    with open(opts['<output>'], 'w') as fobj:
        json.dump(dict(districts=records), fobj)

def update_districts_from_file(fobj, districts):
    reader = csv.reader(fobj)
    for row in reader:
        postcode, _, easting, northing = row[:4]
        easting, northing = float(easting), float(northing)

        # Postcodes are stored so that the first 4 characters are the district.
        # E.g. "AB1 2CD" or "WX123YZ".
        district = postcode[:4].strip()

        old_e, old_n, sample_count = districts.get(district, (0., 0., 0))
        alpha = 1. / (sample_count + 1)
        new_record = (
            (1.-alpha) * old_e + alpha * easting,
            (1.-alpha) * old_n + alpha * northing,
            sample_count + 1,
        )
        districts[district] = new_record

if __name__ == '__main__':
    main()
