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
 * get html for term-box
 */
function get_html_term_box (num, entry) {
    // TODO: make it so i don't have to parse definition twice
    var definition = parse_definition(entry.definition);

    return `
        <button class="term-box" onclick="display_entry('${num}')">
            <div class="term-box-header">${entry.word}</div>
            <div>
                ${entry.type}:<br>
                ${definition}
            </div>
        </button>
    `;
}


/*
 * add result
 */
function add_entry (entry_num) {
    const results_box = document.getElementById('results');
    const entry = this.database.dictionary[entry_num];

    results_box.innerHTML += get_html_term_box(entry_num, entry);
}


var aspect_list = {
    'MOM': 'Momentaneous',
    'CONT': 'Continuative',
    'DUR': 'Durative',
    'CONCL': 'Conclusive',
    'REP': 'Repetitive',
    'SEM': 'Semelfactive',
    'DIST': 'Distributive',
    'DIV': 'Diversative',
    'REV': 'Reversative',
    'CON': 'Conative',
    'TRANS': 'Transitional',
    'CURS': 'Cursive',
    'NEUT': 'Neuter',
    '?': 'Unknown aspect'
};

var pernum_list = {
    '1-SG': 'First person singular',
    '2-SG': 'Second person singular',
    '3-SG': 'Third person singular',
    '3o-SG': 'Third person singular inverted',
    '3a-SG': 'Third person singular obviative',
    '3i-SG': 'Third person singular impersonal',
    '3s-SG': 'Third person singular spacial',
    '1-DPL': 'First person duo-plural',
    '2-DPL': 'Second person duo-plural',
    '1-PL': 'First person plural',
    '2-PL': 'Second person plural',
    '3-PL': 'Third person plural',
    '3o-PL': 'Third person plural inverted',
    '3a-PL': 'Third person plural obviative',
    '3i-PL': 'Third person plural impersonal',
    '3s-PL': 'Third person plural spacial',
    'PASS-A': 'Passive (type A)',
    'PASS-B': 'Passive (type B)',
    'SEMELIT': 'Semeliterative',
    'REV': 'Reversionary'
};


/*
 * convert dictionary definition formatting to html
 */
function parse_definition (definition) {
    var html = '<ol>';

    // TODO: change formatting of definition list (no *)
    // TODO: better regexes
    var re_bullet = /^\* /;
    var re_glossary_link = /\[(\p{L}*)\]/ug;
    var re_italics = /\*(\p{L}*)\*/ug;
    var re_word_link = /\{(\p{L}*)\}/ug;

    for (let i = 0; i < definition.length; ++i) {
        // TODO: lowercase?
        let def = definition[i];
        def = def.replace(re_bullet, '');
        def = def.replace(re_glossary_link, '<a class="glossary-link" href="./glossary.html#' + "$1" + '">' + "$1" + '</a>');
        def = def.replace(re_italics, '<i>' + "$1" + '</i>');
        def = def.replace(re_word_link, '<a href="#' + "$1" + '"><i>' + "$1" + '</i></a>');
        html += '<li>' + def + '</li>';
    }

    html += '</ol>';

    return html;
}


function parse_conjugations (conjugations) {
    var rows = '';
    var top_row = '';

    var mode_list = {
        'IMP': 'Imperfective',
        'ITER': 'Iterative',
        'USIT': 'Usitative',
        'PERF': 'Perfective',
        'FUT': 'Future',
        'OPT': 'Optative'
    };

    for (let i = 0; i < Object.keys(mode_list).length; ++i) {
        var mode = Object.keys(mode_list)[i];
        var mode_name = mode_list[mode];

        if (conjugations[mode] === undefined) {
            continue;
        }

        top_row += `<th><a class="glossary-link" title="${mode_name}" href="../appendix/glossary#${mode_name}">${mode}</a></th>`;
    }

    for (let i = 0; i < Object.keys(pernum_list).length; ++i) {
        var entries = '';
        var pernum = Object.keys(pernum_list)[i];
        var pernum_name = pernum_list[pernum];

        for (let i = 0; i < Object.keys(mode_list).length; ++i) {
            var mode = Object.keys(mode_list)[i];
            var word;

            if (conjugations[mode] === undefined) {
                continue;
            }

            if (conjugations[mode][pernum] === '-') {
                word = '—';
            }
            else {
                word = conjugations[mode][pernum]
            }

            entries += `<td>${word}</td>`;
        }

        rows += `
            <tr>
                <th><a class="glossary-link" title="${pernum_name}" href="../appendix/glossary#Person_number">${pernum}</a></th>
                ${entries}
            </tr>
        `;
    }

    return `
        <span>
            <table>
                <tr>
                    <th></th>
                    ${top_row}
                    ${rows}
                </tr>
            </table>
        </span>
    `;
}


function parse_stems (stems) {
    var rows = '';

    var mode_list = [ 'IMP', 'ITER/USIT', 'PERF', 'FUT', 'OPT' ];

    for (let i = 0; i < Object.keys(aspect_list).length; ++i) {
        var entries = '';
        var aspect = Object.keys(aspect_list)[i];
        var aspect_name = aspect_list[aspect];

        if (stems['IMP'][aspect] === undefined) {
            continue;
        }

        for (let i = 0; i < mode_list.length; ++i) {
            var mode = mode_list[i];
            var stem;

            if (stems[mode][aspect] === '-') {
                stem = '—';
            }
            else {
                stem = stems[mode][aspect]
            }

            entries += `<td>${stem}</td>`;
        }

        rows += `
            <tr>
                <th><a class="glossary-link" title="${aspect_name}" href="../appendix/glossary#${aspect_name}">${aspect}</a></th>
                ${entries}
            </tr>
        `;
    }

    return `
        <span>
            <table>
                <tr>
                    <th></th>
                    <th><a class="glossary-link" title="Imperfective" href="../appendix/glossary#Imperfective">IMP</a></th>
                    <th><a class="glossary-link" title="Iterative" href="../appendix/glossary#Iterative">ITER</a></th>
                    <th><a class="glossary-link" title="Perfective" href="../appendix/glossary#Perfective">PERF</a></th>
                    <th><a class="glossary-link" title="Future" href="../appendix/glossary#Future">FUT</a></th>
                    <th><a class="glossary-link" title="Optative" href="../appendix/glossary#Optative">OPT</a></th>
                    ${rows}
                </tr>
            </table>
        </span>
    `;
}


function parse_verbs (verbs) {
    var bullets = '';

    for (let i = 0; i < Object.keys(aspect_list).length; ++i) {
        var aspect = Object.keys(aspect_list)[i];
        var aspect_name = aspect_list[aspect];
        var line = [];

        if (verbs[aspect] === undefined) {
            continue;
        }

        for (let j = 0; j < verbs[aspect].length; ++j) {
            line.push(`<a href="#${verbs[aspect][j]}"><i>${verbs[aspect][j]}</i></a>`);
        }

        bullets += `<li><a class="glossary-link" title="${aspect_name}" href="../appendix/glossary#${aspect_name}">${aspect}</a>: ${line.join(', ')}</li>`;
    }

    return `
        <ol>
            ${bullets}
        </ol>
    `;
}


/*
 * get html for list of words with links
 */
function get_html_href_list (words) {
    href_str = `<a href="#${words[0]}" onclick="follow_link('${words[0]}')"><i>${words[0]}</i></a>`;

    for (let i = 1; i < words.length; ++i) {
        href_str += `, <a href="#${words[i]}" onclick="follow_link('${words[i]}')"><i>${words[i]}</i></a>`;
    }

    return href_str;
}


///// /*
/////  * get html for modal (verb)
/////  */
///// function get_html_modal_verb (word, root, theme, def, paradigm, theme_prefs, base_prefs) {
/////     var theme_pref_str = '';
/////     var base_pref_str = '';
///// 
/////     if (theme_prefs.length != 0) {
/////         theme_pref_str = `<b>Theme prefixes:</b>&nbsp; ${get_html_href_list(theme_prefs)}<br>`;
/////     }
/////     
/////     if (base_prefs.length != 0) {
/////         base_pref_str = `<b>Base prefixes:</b>&nbsp; ${get_html_href_list(base_prefs)}<br>`;
/////     }
///// 
/////     return `
/////         <div id="modal">
/////             <span id="close" onclick="close_display()">&#x1f5d9;</span>
/////             <div id="page-content-modal">
/////                 <h3>${word}</h3>
/////                 <hr class="underline">
/////                 <span>
/////                     <h4>Derivation</h4>
/////                     <div>
/////                         <b>Root:</b>&nbsp; <a href="./index.html#${root}" onclick="follow_link('${root}')"><i>${root}</i></a><br>
/////                         <b>Theme:</b>&nbsp; ${theme}<br>
/////                         ${theme_pref_str}
/////                         ${base_pref_str}
/////                         <b>Conjugation paradigm:</b>&nbsp; ${paradigm.join(', ')}
/////                     </div>
///// 
/////                     <h4>Verb</h4>
/////                     <div>
/////                         <span>${def}</span>
/////                     </div>
///// 
/////                     <h4>Conjugation</h4>
/////                     <div>BLAH</div>
/////                 </span>
/////             </div>
/////         </div>
/////     `;
///// }
///// 
///// 
///// /*
/////  * get html for modal (root)
/////  */
///// function get_html_modal_root (word, etymology, def) {
/////     return `
/////         <div id="modal">
/////             <span id="close" onclick="close_display()">&#x1f5d9;</span>
/////             <div id="page-content-modal">
/////                 <h3>${word}</h3>
/////                 <hr class="underline">
/////                 <span>
/////                     <h4>Etymology</h4>
/////                     <div>
/////                         <span>${etymology}</span>
/////                     </div>
///// 
/////                     <h4>Root</h4>
/////                     <div>
/////                         <span>${def}</span>
/////                     </div>
/////                 </span>
/////             </div>
/////         </div>
/////     `;
///// }


/*
 * get html for modal (verb)
 */
function get_html_modal_verb (entry) {
    var definition = parse_definition(entry.definition);
    var conjugations = parse_conjugations(entry.conjugations);

    return `
        <div id="modal">
            <span id="close" onclick="close_display()">&#x1f5d9;</span>
            <div id="page-content-modal">
                <h3>${entry.word}</h3>
                <hr class="underline">
                <span>
                    <h4>Derivation</h4>
                    <div>
                        <b>Root:</b>&nbsp; <a href="./index.html#${entry.root}" onclick="follow_link('${entry.root}')"><i>${entry.root}</i></a><br>
                        <b>Aspect:</b>&nbsp; ${entry.aspect}<br>
                        <b>Classifier:</b>&nbsp; ${entry.classifier} (${entry.transtype})<br>
                        <b>Prefixes:</b>&nbsp; ${entry.prefixes}<br>
                        <b>Conjugation paradigm:</b>&nbsp; ${entry.paradigm.join(', ')}
                    </div>

                    <h4>Verb</h4>
                    <div>
                        <span>${definition}</span>
                    </div>

                    <h4>Conjugation</h4>
                    <div>
                        ${conjugations}
                    </div>
                </span>
            </div>
        </div>
    `;
}


/*
 * get html for modal (root)
 */
function get_html_modal_root (entry) {
    var definition = parse_definition(entry.definition);
    var stems = parse_stems(entry.stems);
    var verbs = parse_verbs(entry.verbs);

    // <h4>Etymology</h4>
    // <div>
    //     <span>${entry.etymology}</span>
    // </div>

    return `
        <div id="modal">
            <span id="close" onclick="close_display()">&#x1f5d9;</span>
            <div id="page-content-modal">
                <h3>${entry.word}</h3>
                <hr class="underline">
                <span>
                    <h4>Root</h4>
                    <div>
                        <span>${definition}</span>
                    </div>

                    <h4>Stems</h4>
                    <div>
                        ${stems}
                    </div>

                    <h4>Derived verbs</h4>
                    <div>
                        ${verbs}
                    </div>
                </span>
            </div>
        </div>
    `;
}


/*
 * display a single entry
 */
function display_entry (entry_num) {
    const entry = this.database.dictionary[entry_num];
    const entrybox = document.getElementById('entry');

    // TODO: make links not reload
    if (entry.type == "Verb") {
        entrybox.innerHTML = get_html_modal_verb(entry);
    }
    else if (entry.type == "Root") {
        entrybox.innerHTML = get_html_modal_root(entry);
    }
}


/*
 * follow link to another modal without searching database
 */
function follow_link (entry) {
    var result = search_db_exact(entry);

    // TODO: what to do on failure?
    if (result == -1) {
        return;
    }

    document.getElementById('keyword').value = entry;
    click_search(entry);

    close_display();
    display_entry(result);
}


/*
 * close entry window
 */
function close_display () {
    document.getElementById('entry').innerHTML = "";
}
