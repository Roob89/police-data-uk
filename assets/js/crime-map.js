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

    // Find center
    var mapLat = map.center.lat();
    var mapLng = map.center.lng();
    var mapCenter = {
        lat: mapLat,
        lng: mapLng
    }

    // Zoom in
    map.setZoom(13);



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
    xhttp.open("GET", `https://data.police.uk/api/crimes-street/all-crime?poly=${mapLat-latVariable},${mapLng-lngVariable}:${mapLat+latVariable},${mapLng-lngVariable}:${mapLat+latVariable},${mapLng+lngVariable}:${mapLat-latVariable},${mapLng+lngVariable}`, true);
    xhttp.send();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {


            // Parse response
            response = this.responseText;
            response = JSON.parse(response);
            document.getElementById('found').innerHTML = `Found ${response.length} crimes`;

            console.log( response );

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
                    icon: `../icons/${markerIcon}.png`
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
        default:
            return 'alert-circle'
    }

}