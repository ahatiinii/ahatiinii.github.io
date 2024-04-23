/*
 * search.js: search handling
 */


search_main();


async function search_main () {
    const keyword = window.location.hash.substring(1);

    // add keyword to search bar
    document.getElementById('keyword').value = decodeURIComponent(keyword);

    await db_main();

    if (keyword != undefined) {
        search(keyword);
    }
}


/*
 * run search and update url after search button clicked
 */
function click_search (keyword)
{
    // update hash
    window.location.hash = keyword;

    // delete previous search results
    document.getElementById('match-info').innerHTML = "";
    document.getElementById('results').innerHTML = "";

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
function add_entry (entry_num) {
    const results_box = document.getElementById('results');
    const entry = this.database.dictionary[entry_num];

    var definition = parse_definition(entry.definition);

    results_box.innerHTML +=
        // '<button class="term-box" title="' + entry.word + '" onclick="display_entry(\'' + entry_num + '\')">' +
        '<button class="term-box" title="' + entry.word + '" onclick="window.location.href=\'./dict/' + entry.word + '.html\';">' +
        '<div class="term-box-header">' + entry.word + '</div><div>' +
        '(' + entry.type + ')<br>' +
        definition + 
        '</div></button>';
    // TODO: make it so i don't have to parse definition twice
}


/*
 * convert dictionary definition formatting to html
 */
function parse_definition (definition) {
    var html = '<ol>';

    var re_glossary_link = /\[(.*?)\]/g;
    var  re_italics = /\*(.*?)\*/;
    // var re_word_link = new RegExp('\\{.*?\\}');

    for (let i = 0; i < definition.length; ++i) {
        // TODO: lowercase?
        let def = definition[i];
        def = def.replace(re_glossary_link, '<a class="glossary-link" href="./glossary.html#' + "$1" + '">' + "$1" + '</a>');
        def = def.replace(re_italics, '<i>' + "$1" + '</i>');
        html += '<li>' + def + '</li>';
    }

    html += '</ol>';

    return html;
}


/*
 * display a single entry
 */
function display_entry (entry_num) {
    const entry = this.database.dictionary[entry_num];

    const entrybox = document.getElementById('entry');

    // TODO: make links not reload
    entrybox.innerHTML = '<div id="modal"><span id="close" onclick="close_display()">&times;</span>' +
        '<div id="page-content-modal"><h3>' + entry.word + '</h3><hr class="underline"><span><h4>Derivation</h4>' +
        '<div><b>Root:</b>&nbsp; <a href="./index.html#' + entry.root + '"><i>' + entry.root + '</i></a><br>' +
        '<b>Theme:</b>&nbsp; ' + entry.theme + '<br>' +
        '<b>Theme prefixes:</b>&nbsp; <i>' + entry.theme_prefixes.join(', ') + '</i><br>' + // TODO: fix this hack :(
        '<b>Base prefixes:</b>&nbsp; <i>' + entry.base_prefixes.join(', ') + '</i><br>' +
        '<b>Conjugation paradigm:</b>&nbsp; ' + entry.paradigm.join(', ') + '</div>' +
        '<h4>' + entry.type + '</h4><div>' +
        '<span>' + parse_definition(entry.definition) + '</span></div>' +
        '<h4>Conjugation</h4><div>' + entry.conjugation[0] +
        '</div></span></div></div>';

    // if (entry.theme_prefixes.length != 0) {
    //     entrybox.innerHTML += '<b>Theme prefixes:</b>&nbsp; ';

    //     entrybox.innerHTML += '<a href="./index.html#' + entry.theme_prefixes[0] + '"><i>' + entry.theme_prefixes[0] + '</i></a>';

    //     for (let i = 1; i < entry.theme_prefixes.length; ++i) {
    //         entrybox.innerHTML += ', <a href="./index.html#' + entry.theme_prefixes[i] + '"><i>' + entry.theme_prefixes[i] + '</i></a>';
    //     }
    // }

    // if (entry.base_prefixes.length != 0) {
    //     entrybox.innerHTML += '<b>Base prefixes:</b>&nbsp; ';

    //     // entrybox.innerHTML += '<a href="./index.html#' + entry.base_prefixes[0] + '"><i>' + entry.base_prefixes[0] + '</i></a>';

    //     // for (let i = 1; i < entry.base_prefixes.length; ++i) {
    //     //     entrybox.innerHTML += ', <a href="./index.html#' + entry.base_prefixes[i] + '"><i>' + entry.base_prefixes[i] + '</i></a>';
    //     // }
    // }
    
    // entrybox.innerHTML += '</div></span></div></div>';
}


/*
 * close entry window
 */
function close_display () {
    document.getElementById('entry').innerHTML = "";
}
