# "Find my FLO" site

## Provenance

Post Code data is taken from the OS Code-Point Open Database as of January 2016.

FLO contact data is taken from [PAS website](https://finds.org.uk/) on each
request.

## Updating

The Python programs in the [script](script/) directory may be used to re-create
``districts.json`` in the following manner assuming that the [Code-Point
Open](https://www.ordnancesurvey.co.uk/business-and-government/products/code-point-open.html) dataset
has been extracted to the ``codepo_gb`` directory:

```console
$ pip install -r script/requirements.txt
$ script/collatepostcodes.py codepo_gb/Data/CSV app/districts.json
```

## Data structure

The FLO information in fetched from the PAS website and stored as a flat list of
records. Each record is updated with an British National Grid (BNG) Easting and
Northing. (For our purposes calculating BNG Euclidean distances when searching
for FLOs is good enough.)

The Postcode information is first processed to form an arithmetic mean of BNG
Easting and Northings for each Post Code within each Post Code district. The
Post Code districts are then stored in a
[trie](https://en.wikipedia.org/wiki/Trie) for efficient search. This is more
for compactness of the resulting ``districts.json`` than computational efficiency.
Modern browsers could just search a flat list of post code districts
sufficiently quickly but having approximately O(log<sub>27</sub>(m)) search for
*n* post code districts of length *m* is nice.

## Legal

Except where listed below, this project is licensed under the MIT license. See
[LICENCE.txt](LICENCE.txt).

FLO contact data from https://finds.org.uk/contacts. Licensed under
[CC-BY](http://creativecommons.org/licenses/by/3.0/).

### districts.json

OS Code-Point Open Data Licensed under the
[Open Government License](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) (OGL).

Contains OS data © Crown copyright and database right 2016.

Contains Royal Mail data © Royal Mail copyright and Database right 2016.

Contains National Statistics data © Crown copyright and database right 2016.

