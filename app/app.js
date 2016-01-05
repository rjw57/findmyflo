$(document).ready(function() {
    var postcode_input = $('#postcode'), matches_div = $('#matches');
    var data = { currentStaff: [], districts: [] };

    function clear_matches() {
        matches_div.empty();
        matches_div.append($('<p class="text-muted no-matches">No matches</p>'));
    }

    function distance(p1, p2) {
        de = p1.easting - p2.easting;
        dn = p1.northing - p2.northing;
        return Math.sqrt(de*de + dn*dn);
    }

    function match_flos(loc) {
        var i, flo;

        // Sort staff by distance
        data.currentStaff.sort(function(a, b) {
            // compute distances
            var a_dist = distance(a, loc);
            var b_dist = distance(b, loc);
            return a_dist - b_dist;
        });

        // Process top matches
        matches_div.empty();
        matches_div.append($('<h1>Your closest FLOs</h1>'));
        for(i=0; i<Math.min(data.currentStaff.length, 5); i++) {
            flo = data.currentStaff[i];
            console.log(flo);
        }
    }

    postcode_input.on('input change', function(event) {
        var search_val = postcode_input.val(), matches = [],
            i, district_record;

        // Strip any spaces from search value and convert to upper case.
        search_val = search_val.trim().toUpperCase();

        // Look in data for matching districts
        for(i in data.districts) {
            district_record = data.districts[i];
            if(search_val.indexOf(district_record[0]) == 0) {
                // there was a match!
                matches.push({
                    district: district_record[0],
                    easting: district_record[1],
                    northing: district_record[2],
                });
            }
        }

        if(matches.length == 1) {
            // If one and only one match, return results
            match_flos(matches[0]);
        } else {
            // Otherwise clear matches
            clear_matches();
        }
    });

    $.getJSON('data.json').then(function(r) {
        data = r;
        postcode_input.removeAttr('disabled');
        postcode_input.change();
    });
});
