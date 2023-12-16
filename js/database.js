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
 * search the database
 */
function search_db (query, fuzzy) {
    // change apostrophe or single quote to modifier apostrophe
    var nquery = query.replace(/[\u0027\u2018\u2019]/g, '\u02BC');

    var results = [];

    // exact search
    if (!fuzzy) {
        for (let i = 0; i < this.database.dictionary.length; ++i) {
            if (this.database.dictionary[i].word == nquery) {
                results.push(this.database.dictionary[i]);
                break;
            }
        }
    }
    // fuzzy search
    else {
        nquery = strip_word(nquery);

        for (let i = 0; i < this.database.dictionary.length; ++i) {
            if (this.database.dictionary[i].fuzzy == nquery) {
                results.push(this.database.dictionary[i]);
            }
        }
    }

    return results;
}


/*
 * strip diacritical marks, apostrophes, double vowels, and final -h for fuzzy matching
 */
function strip_word (string) {
    var newstring = string.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    newstring = newstring.replace(/\u0142/g, 'l');
    newstring = newstring.replace(/([aeio])\1/g, '$1');
    newstring = newstring.replace(/[\u0027\u2018\u2019\u02BC]/g, '');

    newstring = newstring.replace(/h([bcdgjklmnstyz])/g, '$1');
    newstring = newstring.replace(/h$/g, '');

    return newstring.toLowerCase();
}
