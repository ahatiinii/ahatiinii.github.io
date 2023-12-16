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
        '<div><p id="morphology" class="term-info"><ul><li>' + entry.root + '</li></ul></p></div>' +
        '<div><p class="term-info">' + entry.type + '</p><p id="definition" class="term-info"><ul><li>' + entry.definition + '</li></ul></p></div>' +
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
    if (res[i].inflection.i_1_sg != undefined)
        cell.innerHTML = res[i].inflection.i_1_sg;
    cell = sgrow.insertCell();
    if (res[i].inflection.i_2_sg != undefined)
        cell.innerHTML = res[i].inflection.i_2_sg;
    cell = sgrow.insertCell();
    if (res[i].inflection.i_3_sg != undefined)
        cell.innerHTML = res[i].inflection.i_3_sg;
    cell = sgrow.insertCell();
    if (res[i].inflection.i_3a_sg != undefined)
        cell.innerHTML = res[i].inflection.i_3a_sg;

    // second row (1.dpl, 2.dpl)
    cell = dplrow.insertCell();
    if (res[i].inflection.i_1_dpl != undefined)
        cell.innerHTML = res[i].inflection.i_1_dpl;
    cell = dplrow.insertCell();
    if (res[i].inflection.i_2_dpl != undefined)
        cell.innerHTML = res[i].inflection.i_2_dpl;
    cell = dplrow.insertCell();
    cell = dplrow.insertCell();

    // third row (1.pl, 2.pl, 3.pl, 3a.pl)
    cell = plrow.insertCell();
    if (res[i].inflection.i_1_pl != undefined)
        cell.innerHTML = res[i].inflection.i_1_pl;
    cell = plrow.insertCell();
    if (res[i].inflection.i_2_pl != undefined)
        cell.innerHTML = res[i].inflection.i_2_pl;
    cell = plrow.insertCell();
    if (res[i].inflection.i_3_pl != undefined)
        cell.innerHTML = res[i].inflection.i_3_pl;
    cell = plrow.insertCell();
    if (res[i].inflection.i_3a_pl != undefined)
        cell.innerHTML = res[i].inflection.i_3a_pl;

    document.body.appendChild(table);
}



// const accordion = document.getElementsByClassName('accordion');
// for (let i = 0; i < accordion.length; ++i) {
//     accordion[i].addEventListener('click', function () {
//         this.classList.toggle('active');
//         let panel = this.nextElementSibling;
// 
//         if (panel.style.display == 'block') {
//             panel.style.display = 'none';
//         }
//         else {
//             panel.style.display = 'block';
//         }
//     });
// }
// 
// 
// show_entry(results[0]);


// function get_word (word) {
//     const table = document.createElement('table');
// 
//     const index = this.store.index('by_word');
//     const request = index.get(word);
// 
//     request.onerror = function () {
//         console.log('Could not access table');
//     }
// 
//     request.onsuccess = function () {
//         const matching = request.result;
//         if (matching !== undefined) {
//             document.getElementById("word").innerHTML += "<b>" + matching.word + "</b>";
//             document.getElementById("root").innerHTML += "root: " + matching.root;
// 
//             for (let key in matching.morphemes) {
//                 document.getElementById("morphology").innerHTML += matching.morphemes[key] + " (" + key + ") ";
//             }
// 
//             document.getElementById("definition").innerHTML += "\"" + matching.definition + "\"";
// 
//             var next = 0;
// 
//             const row = table.insertRow();
// 
//             var cell = row.insertCell();
//             cell.appendChild(document.createTextNode(""));
//             cell = row.insertCell();
//             cell.appendChild(document.createTextNode("first"));
//             cell = row.insertCell();
//             cell.appendChild(document.createTextNode("second"));
//             cell = row.insertCell();
//             cell.appendChild(document.createTextNode("third"));
//             cell = row.insertCell();
//             cell.appendChild(document.createTextNode("fourth"));
// 
//             for (let i = 0; i < 3; ++i) {
//                 const row = table.insertRow();
// 
//                 const cell = row.insertCell();
// 
//                 if (i == 0) {
//                     cell.appendChild(document.createTextNode("singular"));
//                 }
//                 else if (i == 1) {
//                     cell.appendChild(document.createTextNode("duo-plural"));
//                 }
//                 else {
//                     cell.appendChild(document.createTextNode("plural"));
//                 }
// 
//                 for (let j = 0; j < 4; ++j) {
//                     const cell = row.insertCell();
//                     if (!(i == 1 && (j == 2 || j == 3))) {
//                         cell.appendChild(document.createTextNode(Object.values(matching.inflection)[next]));
//                         ++next;
//                     }
//                     cell.style.border = '1px solid black';
//                 }
//             }
// 
//             document.body.appendChild(table);
//         }
//         else {
//             console.log('Could not find word');
//         }
//     }
