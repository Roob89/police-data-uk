// Variables
var map;
var crimeButton = document.getElementById('find-crimes-button');
var markers = [];
var polygon;
var infoWindow;

// Init map
function initMap() {

    // Generate map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 53.8051108,
            lng: -0.9550018
        },
        zoom: 7
    });

}
initMap();


// Button functionality
crimeButton.addEventListener('click', findCrimes);


// Find crimes button
function findCrimes() {

    updateButtonText( 'Loading' );

    // Find center
    var mapLat = map.center.lat();
    var mapLng = map.center.lng();
    var mapCenter = {
        lat: mapLat,
        lng: mapLng
    }

    // Zoom in
    map.setZoom(13);

    // Get dates
    var month = document.getElementById('month').value;
    var year = document.getElementById('year').value;


    // Polygon
    var latVariable = 0.02;
    var lngVariable = 0.05;
    var polygonCoords = [{
            lat: mapLat - latVariable,
            lng: mapLng - lngVariable
        },
        {
            lat: mapLat + latVariable,
            lng: mapLng - lngVariable
        },
        {
            lat: mapLat + latVariable,
            lng: mapLng + lngVariable
        },
        {
            lat: mapLat - latVariable,
            lng: mapLng + lngVariable
        }
    ];

    // Clear Polygon
    if (polygon) {
        polygon.setMap(null);
    }

    // Add polygon
    polygon = new google.maps.Polygon({
        paths: polygonCoords,
        strokeWeight: 0,
        fillColor: '#FF0000',
        fillOpacity: 0.2
    });
    polygon.setMap(map);


    // Info window
    infoWindow = new google.maps.InfoWindow({
        content: 'Test'
    });


    // Clears markers
    clearMarkers();


    // API call
    var xhttp = new XMLHttpRequest();
    var url = `https://data.police.uk/api/crimes-street/all-crime?poly=${mapLat-latVariable},${mapLng-lngVariable}:${mapLat+latVariable},${mapLng-lngVariable}:${mapLat+latVariable},${mapLng+lngVariable}:${mapLat-latVariable},${mapLng+lngVariable}&date=${year}-${month}`
    console.log(`API call to : ${url}`);
    xhttp.open("GET", url, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {


            // Parse response
            response = this.responseText;
            response = JSON.parse(response);
            updateFoundText( `Found ${response.length} crimes` );
            

            for (var i = 0; i < response.length; i++) {

                // Variables
                var crime = response[i];
                var crimeLocation = {
                    lat: parseFloat(crime.location.latitude),
                    lng: parseFloat(crime.location.longitude)
                }

                // Get icon
                markerIcon = chooseIcon(crime.category);

                // Add markers
                var marker = new google.maps.Marker({
                    position: crimeLocation,
                    map: map,
                    icon: `assets/icons/${markerIcon}.png`
                });

                // Set info
                marker.crimeID = crime.id;
                marker.crimeCategory = crime.category;
                marker.crimeLocation = crime.location.street.name;
                marker.crimeMonth = crime.month;


                // Event listener
                google.maps.event.addListener(marker, 'click', function () {
                    infoWindow.setContent(`
                    <strong>ID:${this.crimeID}</strong><br>
                    Category: ${this.crimeCategory}<br>
                    Location: ${this.crimeLocation}<br>
                    Month: ${this.crimeMonth}<br>
                    `);
                    infoWindow.open(map, this);
                });


                // Push to array
                markers.push(marker);

            }

            updateButtonText();


        } else if(this.readyState == 4 && this.status == 503) {

            console.log('Error 503 : Too many results');
            updateFoundText( `Too many results to load` );
            updateButtonText( 'Loading' );

        } else if(this.readyState == 4 && this.status == 404) {

            console.log('Error 404');
            updateFoundText( `Nothing found` );
            updateButtonText();

        } else {

            console.log(`State: ${this.readyState} | Status: ${this.status}`);


        }
    };







}

// Clear markers
function clearMarkers() {
    if (markers.length != 0) {
        console.log(`Clearing ${markers.length} markers`);
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers = [];
    } else {
        console.log('No markers to clear');
    }
}


// Update button text
function updateButtonText( text ) {
    if( text ) {
        crimeButton.innerHTML = text;
    } else {
        crimeButton.innerHTML = 'Find recent crimes';
    }
}

// Update found text
function updateFoundText( text ) {
    document.getElementById('found').innerHTML = text;
}



// Choose Icon
function chooseIcon(value) {

    switch (value) {
        case 'anti-social-behaviour':
            return 'emoticon-angry'
            break;
        case 'bicycle-theft':
            return 'bicycle'
            break;
        case 'burglary':
            return 'house'
            break;
        case 'criminal-damage-arson':
            return 'fire'
            break;
        case 'drugs':
            return 'pill'
            break;
        case 'possession-of-weapons':
            return 'knife-military'
            break;
        case 'shoplifting':
            return 'cart'
            break;
        case 'vehicle-crime':
            return 'car'
            break;
        case 'violent-crime':
            return 'handball'
            break;
        default:
            return 'alert-circle'
    }

}