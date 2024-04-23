/*
 * keyboard.js: keyboard input handling
 */


/*
 * process keypresses in the input field
 */
function check_keys (ev) {
    const input = document.getElementById('keyword');
    var cursorpos = input.selectionStart;

    if (ev.key == 'Enter') {
        document.getElementById('search-button').click();
    }

    // treat accented letters as single letters for delete/backspace
    else if (input.selectionStart == input.selectionEnd) {
        if (ev.key == 'Backspace') {
            if (input.value[cursorpos - 1] == '\u0301') {
                input.value = input.value.slice(0, cursorpos - 1) + input.value.slice(cursorpos);
                input.selectionStart = input.selectionEnd = cursorpos - 1;
            }
        }
        else if (ev.key == 'Delete') {
            if (input.value[cursorpos + 1] == '\u0301') {
                input.value = input.value.slice(0, cursorpos + 1) + input.value.slice(cursorpos + 2);
                input.selectionStart = input.selectionEnd = cursorpos;
            }
        }
    }
}


/*
 * toggle keyboard
 */
function toggle_keyboard () {
    const keyboard = document.getElementById('keyboard');
    const keyboard_down = document.getElementById('keyboard-down-button');
    const keyboard_up = document.getElementById('keyboard-up-button');

    if (keyboard.style.display == 'flex') {
        keyboard.style.display = 'none';
        keyboard_up.style.display = 'none';
        keyboard_down.style.display = 'inline';
    }
    else {
        keyboard.style.display = 'flex';
        keyboard_up.style.display = 'inline';
        keyboard_down.style.display = 'none';
    }
}


/*
 * special character button entry
 */
function enter_letter (letter) {
    const input = document.getElementById('keyword');
    var cursorpos = input.selectionStart;

    input.value = input.value.slice(0, cursorpos) + letter + input.value.slice(cursorpos);

    input.focus();

    // adjust cursor position accounting for double characters
    input.selectionStart = input.selectionEnd = cursorpos + letter.length;
}
