// Get data from url
var url_string = window.location.href;
var url = new URL(url_string);
var force = url.searchParams.get("force");
var id = url.searchParams.get("id");
var response;

// Get neighbourhood info
var xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://data.police.uk/api/" + force + "/" + id, true);
xhttp.send();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        response = this.responseText;
        response = JSON.parse(response);

        console.log(response);

        updateBasicDetails();
        getPriorities()

    }
};


// Basic details
function updateBasicDetails() {

    document.getElementById('name').innerHTML = response.name;
    document.getElementById('description').innerHTML = (response.description) ? response.description : 'No description available.';
    document.getElementById('population').innerHTML = (response.population) ? response.population : 'No data available.';

}


// Priorities
function getPriorities() {

    // Variables
    var priorities;

    // API call
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://data.police.uk/api/" + force + "/" + id + "/priorities", true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            priorities = this.responseText;
            priorities = JSON.parse(priorities);
            updatePriorities();
            initMap();
        }
    };

    // Update html
    function updatePriorities() {

        newHTML = '';
        if (priorities.length > 0) {

            // Has priorities    
            for (var i = 0; i < priorities.length && i < 3; i++) {
                var obj = priorities[i];
                if (i != 0) {
                    newHTML = newHTML + '<hr>';
                }
                newHTML = newHTML + `<strong>Issue</strong><br>${obj.issue}<strong>Action</strong><br>${obj.action}`;
            }

        } else {

            // No priorities    
            newHTML = `No data given.`;

        }

        // Update HTML
        document.getElementById('priorities').innerHTML = newHTML;

    }

}


// Neightbourhood boundary
function boundary() {

    var boundary;

    // API call
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "https://data.police.uk/api/" + force + "/" + id + "/boundary", true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            // Parse response
            boundary = this.responseText;
            boundary = JSON.parse(boundary);

            // Make array
            var boundaryArray = [];
            for (var i = 0; i < boundary.length; i++) {
                boundaryArray.push({
                    lat: parseFloat(boundary[i].latitude),
                    lng: parseFloat(boundary[i].longitude)
                });
            }

            // Draw polygon
            var neighbourhoodBoundary = new google.maps.Polygon({
                paths: boundaryArray,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                fillColor: '#FF0000',
                fillOpacity: 0.35
            });
            neighbourhoodBoundary.setMap(map);

        }
    };


}


// Map
var map;

function initMap() {

    // Variables
    var lat = parseFloat(response.centre.latitude);
    var lng = parseFloat(response.centre.longitude);

    // Basic map
    map = new google.maps.Map(document.getElementById('map-container'), {
        center: {
            lat: lat,
            lng: lng
        },
        zoom: 12
    });

    // Boundary
    boundary();

    var marker = new google.maps.Marker({
        position: {
            lat: lat,
            lng: lng
        },
        map: map
    });
}