/*
 * input.js: input handling
 */


/*
 * special character button entry
 */
function enter_letter (letter) {
    const input = document.getElementById('keyword');
    var cursorpos = input.selectionStart;

    input.value = input.value.slice(0, cursorpos) + letter + input.value.slice(cursorpos);

    input.focus();
    input.selectionStart = input.selectionEnd = cursorpos + letter.length;
}
