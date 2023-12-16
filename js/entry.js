/*
 * entry.js: dictionary entry display
 */


/*
 * add search result box
 */
function add_entry (entry) {
    // const term = document.getElementById('term');
    // const morphology = document.getElementById('morphology');
    // const definition = document.getElementById('definition');

    const results = document.getElementById('results');

    results.innerHTML +=
        '<div class="term-box">' +
        '<div><p id="term" class="term-header"><i>' + entry.word + '</i></p></div>' +
        '<div><p id="morphology" class="term-info">';

    for (let key in entry.morphemes) {
        if (key != 'stem') {
            if (typeof entry.morphemes[key] === 'string') {
                results.innerHTML += entry.morphemes[key].replace(/[0-9]/g, '');
                results.innerHTML += '- (' + key + ') + ';
            }
            else {
                for (let morph in entry.morphemes[key]) {
                    results.innerHTML += morph.replace(/[0-9]/g, '');
                    results.innerHTML += '- (' + key + ') + ';
                }
            }
        }
    }

    results.innerHTML +=
        '-' + entry.morphemes.stem + ' [' + entry.root + ']</p></div>' +
        '<div><p class="term-info">' + entry.type + ' (' + entry.paradigm + ')</p>' +
        '<p id="definition" class="term-info"><q>' + entry.definition + '</q></p></div>' +
        '</div>';

    const table = document.createElement('table');

    // row header
    const hrow = table.insertRow();
    var cell = document.createElement('th');
    hrow.appendChild(cell);
    cell = document.createElement('th');
    cell.innerHTML = '1';
    hrow.appendChild(cell);
    cell = document.createElement('th');
    cell.innerHTML = '2';
    hrow.appendChild(cell);
    cell = document.createElement('th');
    cell.innerHTML = '3';
    hrow.appendChild(cell);
    cell = document.createElement('th');
    cell.innerHTML = '4';
    hrow.appendChild(cell);

    // column header
    const sgrow = table.insertRow();
    cell = document.createElement('th');
    cell.innerHTML = 'sg';
    sgrow.appendChild(cell);
    const dplrow = table.insertRow();
    cell = document.createElement('th');
    cell.innerHTML = 'dpl';
    dplrow.appendChild(cell);
    const plrow = table.insertRow();
    cell = document.createElement('th');
    cell.innerHTML = 'pl';
    plrow.appendChild(cell);

    // first row (1.sg, 2.sg, 3.sg, 3a.sg)
    cell = sgrow.insertCell();
    if (entry.inflection.i_1_sg != undefined)
        cell.innerHTML = entry.inflection.i_1_sg;
    cell = sgrow.insertCell();
    if (entry.inflection.i_2_sg != undefined)
        cell.innerHTML = entry.inflection.i_2_sg;
    cell = sgrow.insertCell();
    if (entry.inflection.i_3_sg != undefined)
        cell.innerHTML = entry.inflection.i_3_sg;
    cell = sgrow.insertCell();
    if (entry.inflection.i_3a_sg != undefined)
        cell.innerHTML = entry.inflection.i_3a_sg;

    // second row (1.dpl, 2.dpl)
    cell = dplrow.insertCell();
    if (entry.inflection.i_1_dpl != undefined)
        cell.innerHTML = entry.inflection.i_1_dpl;
    cell = dplrow.insertCell();
    if (entry.inflection.i_2_dpl != undefined)
        cell.innerHTML = entry.inflection.i_2_dpl;
    cell = dplrow.insertCell();
    cell = dplrow.insertCell();

    // third row (1.pl, 2.pl, 3.pl, 3a.pl)
    cell = plrow.insertCell();
    if (entry.inflection.i_1_pl != undefined)
        cell.innerHTML = entry.inflection.i_1_pl;
    cell = plrow.insertCell();
    if (entry.inflection.i_2_pl != undefined)
        cell.innerHTML = entry.inflection.i_2_pl;
    cell = plrow.insertCell();
    if (entry.inflection.i_3_pl != undefined)
        cell.innerHTML = entry.inflection.i_3_pl;
    cell = plrow.insertCell();
    if (entry.inflection.i_3a_pl != undefined)
        cell.innerHTML = entry.inflection.i_3a_pl;

    results.children[results.children.length - 1].appendChild(table);
}
