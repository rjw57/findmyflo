$(document).ready(function() {
    var postcode_input = $('#postcode'), matches_div = $('#matches');
    var data = { currentStaff: [], districts: [] };
    var cached_flo_matches = [];

    var GMAPS_KEY = 'AIzaSyBjoyx9G_O_05_ZTFtSW8GsFIOXgrJCXCs';

    function locate_postcode_district(district) {
        var i, node;

        // Pad district with "." to 4 characters
        if(district.length > 4) {
            console.log('Invalid district: ');
            console.log(district);
        }
        while(district.length < 4) { district = district + '.'; }

        // Districts are stored as a prefix tree starting from districts. If at
        // any stage there is no tree branch for the district, return no-match.
        node = data.districts;
        for(i in district) {
            node = node[district[i]];
            if(!node) { return null; }
        }

        // Trim padding from district
        district = district.replace(/\./g, '');
        return { easting: node[0], northing: node[1], district: district };
    }

    function clear_matches() {
        matches_div.empty();
        $('#no-match-panel').removeClass('hidden');
        $('#match-panel').addClass('hidden');
        matches_div.append($('<p class="text-muted no-matches">No matches</p>'));
    }

    function distance(p1, p2) {
        de = p1.easting - p2.easting;
        dn = p1.northing - p2.northing;
        return Math.sqrt(de*de + dn*dn);
    }

    function render_map(center) {
        var frame = $('<iframe>');
        frame.attr({
            frameborder: 0, style: "border:0", allowfullscreen: 1,
            src: 'https://www.google.com/maps/embed/v1/place?' + $.param({
                key: GMAPS_KEY, q: center,
            }),
        });
        return frame;
    }

    function arrays_are_equal(a, b) {
        return $(a).not(b).get().length === 0 && $(b).not(a).get().length === 0;
    }

    function render_flo(flo, loc) {
        function text(t) { return document.createTextNode(t); }

        var flo_dist = distance(flo, loc); // in metres
        var flo_elem = $('<div class="flo">');
        var flo_body = $('<div class="panel-body">');
        var flo_map = render_map(flo.postcode).addClass('flo-map');

        var flo_address = $('<address class="flo-address">').append([
            $('<strong>').text(flo.firstname + ' ' + flo.lastname),
            $('<br>'),
            text(flo.address_1), $('<br>'),
            text(flo.address_2), $('<br>'),
            text(flo.town), $('<br>'),
            text(flo.county), $('<br>'),
            text(flo.postcode), $('<br>'),
        ]);

        var flo_contact = $('<div class="flo-contact">').append([
            $('<span class="glyphicon glyphicon-phone-alt">'),
            $('<span class="hidden">').text("Telephone:"),
            text(' ' + flo.telephone),

            $('<br>'),

            $('<span class="glyphicon glyphicon-pencil">'),
            $('<span class="hidden">').text("Email:"),
            text(' '),
            $('<a>').attr('href', 'mailto:' + flo.email_one).text(flo.email_one),
        ]);

        flo_body.append($('<div class="row">').append([
            $('<div class="col-md-7 col-sm-12 hidden-xs">').append(flo_map),
            $('<div class="col-md-5 col-sm-12">').append([flo_address, flo_contact]),
        ]));

        flo_elem.append($('<div class="panel panel-default">').append([
            $('<div class="panel-heading">').append(
                $('<h3 class="panel-title">').text(
                    flo.firstname + ' ' + flo.lastname +
                    ' (' + flo.staffregions + ')'
                )
            ),
            flo_body
        ]));

        console.log(flo_dist);
        console.log(flo);
        return flo_elem;
    }

    function match_flos(loc) {
        var i, flo, matches;

        // Sort staff by distance
        data.currentStaff.sort(function(a, b) {
            // compute distances
            var a_dist = distance(a, loc);
            var b_dist = distance(b, loc);
            return a_dist - b_dist;
        });

        // Slice array
        matches = data.currentStaff.slice(0, 5);

        // Process top matches
        $('#district').text(loc.district);
        $('#no-match-panel').addClass('hidden');
        $('#match-panel').removeClass('hidden');

        // Render matches
        if(arrays_are_equal(matches, cached_flo_matches)) {
            return;
        }
        matches_div.empty();
        for(i in matches) {
            matches_div.append(render_flo(matches[i], loc));
        }
        cached_flo_matches = matches;
    }

    function search() {
        var search_val = postcode_input.val(), match;

        // Strip any leading/trailing spaces from search value and convert to
        // upper case. Split search val at spaces retaining first part.
        search_val = search_val.trim().toUpperCase().split(' ')[0];

        // Search database
        match = locate_postcode_district(search_val);
        if(!match) {
            // no matches
            clear_matches();
            return;
        }

        // Otherwise, match flo to location
        match_flos(match);
    }

    postcode_input.on('input change', function(event) { search(); });

    $.getJSON('data.json').then(function(r) {
        data = r;
        postcode_input.removeAttr('disabled');
        search();
    });
});