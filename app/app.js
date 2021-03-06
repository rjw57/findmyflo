// Add a definition for EPSG:27700 (BNG) to proj4js
proj4.defs('EPSG:27700', '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs');

$(document).ready(function() {
    // Contants
    var GOOGLE_API_KEY = 'AIzaSyBjoyx9G_O_05_ZTFtSW8GsFIOXgrJCXCs';
    var METRES_PER_MILE = 1609.34;
    var FLO_URL = 'https://finds.org.uk/contacts/index/index/format/json';

    // DOM elements
    var postcode_input = $('#postcode'), matches_div = $('#matches');
    var loading = $('.loading');

    // Globals
    var districts = [], flos = [];

    // DATA PROCESSING FUNCTIONS

    // Take a currentStaff object returned from PAS and fill global variable
    // flos with a set of FLO records.
    function loadFLOs(staff_data) {
        var i, record, p;
        flos = [];
        for(i in staff_data) {
            record = staff_data[i];
            if(record.staffroles != 'Finds Liaison Officer') {
                continue;
            }

            // Map from lng/lat to BNG
            p = proj4('EPSG:4326', 'EPSG:27700',
                      [record.longitude, record.latitude]);
            record.easting = p[0];
            record.northing = p[1];

            flos.push(record);
        }
    }

    // Take a postcode district as a string and return an object with easting,
    // northing and district properties for the matching district. Return null
    // if no match found.
    function locatePostCodeDistrict(district) {
        var i, node;

        // Pad district with "." to 4 characters
        if(district.length > 4) {
            console.log('Invalid district: ');
            console.log(district);
        }
        while(district.length < 4) { district = district + '.'; }

        // Districts are stored as a prefix tree starting from districts. If at
        // any stage there is no tree branch for the district, return no-match.
        node = districts;
        for(i in district) {
            node = node[district[i]];
            if(!node) { return null; }
        }

        // Trim padding from district
        district = district.replace(/\./g, '');
        return { easting: node[0], northing: node[1], district: district };
    }

    // Return the Eulidean distance between any two objects with easting and
    // northing properties.
    function distance(p1, p2) {
        de = p1.easting - p2.easting;
        dn = p1.northing - p2.northing;
        return Math.sqrt(de*de + dn*dn);
    }

    // DOM MANIPULATION

    // Clear any rendered matches.
    function clearMatches() {
        matches_div.empty();
        $('#no-match-panel').removeClass('hidden');
        $('#match-panel').addClass('hidden');
        matches_div.append($('<p class="text-muted no-matches">No matches</p>'));
    }

    // Return a DOM element for a map centred on a location.
    function renderMap(loc) {
        var img = $('<img>');

        img.attr('alt', 'Map of ' + loc);
        img.attr('src', 'https://maps.googleapis.com/maps/api/staticmap?' + $.param({
            key: GOOGLE_API_KEY, size:'209x157', scale: 2, center: loc,
            zoom: 12,
        }));
        return img;
    }

    // Return a DOM element for a FLO.
    function renderFLOElement(flo, loc) {
        function text(t) { return document.createTextNode(t); }

        var flo_dist = distance(flo, loc); // in metres
        var flo_elem = $('<div class="flo">');
        var flo_body = $('<div class="panel-body">');
        var flo_map = $('<div>').append(renderMap(flo.postcode + ', UK')).addClass('flo-map');

        var flo_address = $('<address class="flo-address">').append([
            $('<strong>').text(flo.firstname + ' ' + flo.lastname),
            $('<br>'),
            text(flo.address_1), $('<br>'),
            text(flo.address_2), $('<br>'),
            text(flo.town), $('<br>'),
            text(flo.county), $('<br>'),
            text(flo.postcode), $('<br>'),
        ]);

        var flo_contact = $('<div class="flo-contact col-xs-12">').append([
            $('<div>').append([
                $('<span class="glyphicon glyphicon-phone-alt">'),
                $('<span class="hidden">').text("Telephone:"),
                text(' ' + flo.telephone),
            ]),

            $('<div>').append([
                $('<span class="glyphicon glyphicon-pencil">'),
                $('<span class="hidden">').text("Email:"),
                text(' '),
                $('<a>').attr('href', 'mailto:' + flo.email_one).text(flo.email_one),
            ]),
        ]);

        flo_body.append($('<div class="row">').append([
            $('<div class="col-sm-8 col-md-6">').append(flo_address),
            $('<div class="col-sm-4 col-md-6 hidden-xs">').append(flo_map),
        ]));
        flo_body.append($('<div class="row">').append(flo_contact));

        flo_elem.append($('<div class="panel panel-default">').append([
            $('<div class="panel-heading">').append(
                $('<h3 class="panel-title">').text(
                    (flo_dist / METRES_PER_MILE).toFixed(1) + ' miles, ' +
                    flo.firstname + ' ' + flo.lastname
                )
            ),
            flo_body
        ]));

        return flo_elem;
    }

    // INTERACTION FUNCTIONS

    // Update list of FLO matches for a given location with easting and
    // northing properties.
    function matchFLOs(loc) {
        var i, flo, matches, row_elems, rows;

        // Sort staff by distance
        flos.sort(function(a, b) {
            // compute distances
            var a_dist = distance(a, loc);
            var b_dist = distance(b, loc);
            return a_dist - b_dist;
        });

        // Slice array
        matches = flos.slice(0, 6);

        // Process top matches
        $('#district').text(loc.district);
        $('#no-match-panel').addClass('hidden');
        $('#match-panel').removeClass('hidden');

        // Render matches
        rows = [];
        row_elems = [];
        for(i in matches) {
            row_elems.push($('<div class="col-md-6 col-sm-12">').append(
                renderFLOElement(matches[i], loc)
            ));
            if(row_elems.length == 2) {
                rows.push(row_elems);
                row_elems = [];
            }
        }
        if(row_elems.length != 0) {
            rows.push(row_elems);
        }

        matches_div.empty();
        for(i in rows) {
            matches_div.append($('<div class="row">').append(rows[i]));
        }
    }

    // Search for FLOs within a postcode district.
    function search() {
        var search_val = postcode_input.val(), match;

        // Strip any leading/trailing spaces from search value and convert to
        // upper case. Split search val at spaces retaining first part.
        search_val = search_val.trim().toUpperCase().split(' ')[0];

        // Search database
        match = locatePostCodeDistrict(search_val);
        if(!match) {
            // no matches
            clearMatches();
            return;
        }

        // Otherwise, match flo to location
        matchFLOs(match);
    }

    // EVENT HANDLERS AND INITIALISATION

    // Call search() whenever post code input element changes.
    postcode_input.on('input change', function(event) { search(); });

    // Kick-off external data loading.
    $.when($.getJSON('districts.json'), $.getJSON(FLO_URL)).then(
        function(_districts, _flos) {
            districts = _districts[0].districts;
            loadFLOs(_flos[0].currentStaff);
            postcode_input.removeAttr('disabled');
            loading.addClass('loaded');
            search();
        }
    );
});
