/*
 * database.js: IndexedDB code
 */


var database;


async function db_main () {
    var response = await fetch('./data/dictionary.json');
    var text = await response.text();
    var json = JSON.parse(text);

    this.database = json;
}



/*
 * search the database for an exact match
 */
function search_db_exact (query) {
    for (let i = 0; i < this.database.dictionary.length; ++i) {
        if (this.database.dictionary[i].word == query) {
            return i;
        }
    }

    return -1;
}


/*
 * search the database
 */
function search_db (query) {
    // normalized query string
    var nquery = query.replace(/[\u0027\u2018\u2019]/g, '\u02BC').toLowerCase();

    // stripped query string for fuzzy matching
    var squery = strip_word(nquery);

    var results_exact = [];
    var results_fuzzy = [];
    var results_definition = [];

    for (let i = 0; i < this.database.dictionary.length; ++i) {
        // TODO: make fuzzy matching work again
        // if (this.database.dictionary[i].fuzzy == squery) {
        //     if (this.database.dictionary[i].word.toLowerCase() == nquery) {
        //         // exact match
        //         results_exact.push(i);
        //     }
        //     else {
        //         // fuzzy match
        //         results_fuzzy.push(i);
        //     }
        // }

        if (this.database.dictionary[i].word.toLowerCase() == nquery) {
            // exact match
            results_exact.push(i);
        }
        else {
            // TODO: does this have to be like this?
            let re = new RegExp('\\b' + nquery + '\\b');

            for (let j = 0; j < this.database.dictionary[i].definition.length; ++j) {
                // TODO: strip special characters from definition
                if (this.database.dictionary[i].definition[j].toLowerCase().match(re)) {
                    // match in definition
                    results_definition.push(i);
                }
            }
        }
    }

    // results in order: exact match, fuzzy match, match in definition
    return results_exact.concat(results_fuzzy, results_definition);
}


/*
 * strip diacritical marks, apostrophes, double vowels, and final -h for fuzzy matching
 */
function strip_word (string) {
    var newstring = string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    newstring = newstring.replace(/\u0142/g, 'l');
    newstring = newstring.replace(/([aeio])\1/g, '$1');
    newstring = newstring.replace(/\u02BC/g, '');

    newstring = newstring.replace(/h$/g, '');

    return newstring;
}
