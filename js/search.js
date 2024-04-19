/*
 * search.js: search handling
 */


search_main();


async function search_main () {
    const keyword = new URL(location.href).searchParams.get('keyword');

    document.getElementById('keyword').value = keyword;

    await db_main();

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

    var results = search_db(query);

    if (results.length == 0) {
        document.getElementById('match-info').innerHTML += 'There were no results matching the search.';
    }
    else {
        for (let i = 0; i < results.length; ++i) {
            add_entry(results[i]);
        }
    }
}


/*
 * add result
 */
function add_entry (entry) {
    const results = document.getElementById('results');

    results.innerHTML +=
        '<div class="term-box">' +
        '<p><a href="./dict/' + entry.word + '"><b>' + entry.word + '</b> : &nbsp;&nbsp;' + entry.definition + '</a></p>' +
        '<div id="arrow"></div>' +
        '</div>';

    // results.innerHTML +=
    //     '<div class="term-box">' +
    //     '<p>hello</p>' +
    //     '<div><p><i>' + entry.word + '</i></p></div>' +
    //     '<div><p><q>' + entry.definition + '</q></p></div>' +
    //     '</div>';
}
