


// API request
var xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://data.police.uk/api/forces", true);
xhttp.send();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        var response = this.responseText;
        response = JSON.parse(response);
        updateDOM(response);
    }
};

// Amend DOM
function updateDOM( data ) {

    var regionContainerElement = document.getElementById('region-container');
    var newHTML = '';

    for (var i = 0; i < data.length; i++) {
        var obj = data[i];
        newHTML = newHTML + `<a class="region-container__item" href="force?id=` + obj.id + `">` + obj.name + `</a>`;
    }

    regionContainerElement.innerHTML = newHTML;
}