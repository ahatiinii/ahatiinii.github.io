/*
 * search.js: search handling
 */


search_main();


async function search_main () {
    const keyword = new URL(location.href).searchParams.get('keyword');

    await load_json();

    if (keyword != undefined)
        search(keyword);
}


/*
 * display search results
 */
function search (query) {
    if (query == '') {
        return;
    }

    var results = search_db(query, false);

    if (results.length == 1) {
        // exact match
        add_entry(results[0]);
    }
    else {
        // no exact match
        results = search_db(query, true);

        if (results.length != 0) {
            // fuzzy matches
            document.getElementById('match-info').innerHTML += 'There were no exact matches for the search.<br><br>Near matches:';

            for (let i = 0; i < results.length; ++i) {
                add_entry(results[i]);
            }
        }
        else {
            document.getElementById('match-info').innerHTML += 'There were no results matching the search.';
        }
    }
}
