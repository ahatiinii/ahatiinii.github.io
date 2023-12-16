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
        '<div><p id="definition" class="term-info">' + entry.definition + '</p></div>' +
        '</div>';
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
