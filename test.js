main();

async function main () {
    var response = await fetch('./data/dictionary.json');
    var text = await response.text();
    var json = JSON.parse(text);

    console.log(json);
}

