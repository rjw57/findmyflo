# "Find my FLO" site

## Provenance

Post Code data is taken from the OS Code-Point Open Database as of January 2016.

FLO contact data is taken from [PAS website](https://finds.org.uk/) as of
January 2016.

## Updating

The Python programs in the [script](script/) directory may be used to re-create
``data.json`` in the following manner assuming that the Code-Point Open dataset
has been extracted to the ``codepo_gb`` directory:

```console
$ pip install -r script/requirements.txt
$ script/collatepostcodes.py codepo_gb/Data/CSV postcode.json
$ script/extractflolist.py flo.json
$ script/mergejson.py app/data.json postcode.json flo.json
```

## Legal

Except where listed below, this project is licensed under the MIT license. See
[LICENCE.txt](LICENCE.txt).

### data.json

FLO contact data from https://finds.org.uk/contacts. Licensed under
[CC-BY](http://creativecommons.org/licenses/by/3.0/).

OS Code-Point Open Data Licensed under the
[Open Government License](http://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/) (OGL).

Contains OS data © Crown copyright and database right 2016.

Contains Royal Mail data © Royal Mail copyright and Database right 2016.

Contains National Statistics data © Crown copyright and database right 2016.

