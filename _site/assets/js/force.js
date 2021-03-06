// Get data from url
var url_string = window.location.href;
var url = new URL(url_string);
var id = url.searchParams.get("id");
var response;


// API call
var xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://data.police.uk/api/forces/" + id, true);
xhttp.send();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
        response = this.responseText;
        response = JSON.parse(response);

        console.log(response);

        updateBasicDetails();
        updateEngagementMethods();

    }
};


// Update basic details
function updateBasicDetails() {

    document.getElementById('name').innerHTML = response.name;
    document.getElementById('description').innerHTML = (response.description) ? response.description : 'No description available.';
    document.getElementById('url').innerHTML = (response.url) ? `<a href="${response.url}" target="_blank" rel="noopener nofollow noreferrer">${response.url}</a>` : 'No URL given.';
    document.getElementById('telephone').innerHTML = (response.telephone != "") ? response.telephone : 'No telephone given.';

}


// Update engagement methods
function updateEngagementMethods() {

    engagementMethods = response.engagement_methods;
    newHTML = '';
    for (var i = 0; i < engagementMethods.length; i++) {
        var obj = engagementMethods[i];
        if (obj.url != '') {
            newHTML = newHTML + `<h3 class="engagement-methods__title">${obj.title}</h3>${obj.description}<a href="${obj.url}" type="${obj.type}" target="_blank" rel="nofollow noreferrer noopener">${obj.url}</a>`;
        } else {
            newHTML = newHTML + `<h3>${obj.title}</h3>${obj.description}`;
        }
    }
    document.getElementById('engagement-methods').innerHTML = newHTML;

}


// Neighbourhoods
var xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://data.police.uk/api/" + id + '/neighbourhoods', true);
xhttp.send();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

        // Parse the response
        var response = this.responseText;
        response = JSON.parse(response);

        // Loop
        newHTML = '';
        if (response.length > 0) {
            for (var i = 0; i < response.length; i++) {
                var obj = response[i];
                newHTML = newHTML + `<a class="neighbourhoods__item" href="neighbourhood?force=${id}&id=${obj.id}">${obj.name}</a>`;
            }
        }

        // Update DOM
        document.getElementById('neighbourhoods-container').innerHTML = newHTML;

    }
}


// Senior Officer API request
var xhttp = new XMLHttpRequest();
var response = null;
xhttp.open("GET", "https://data.police.uk/api/forces/" + id + '/people', true);
xhttp.send();
xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {

        // Parse response
        response = this.responseText;
        seniorOfficers = JSON.parse(response);
        console.log(seniorOfficers);

        // Loop through the results
        var newHTML = '';
        if (seniorOfficers.length > 0) {

            // Generate new html
            for (var i = 0; i < seniorOfficers.length; i++) {

                // Variables
                var obj = seniorOfficers[i];
                obj.bio = (obj.bio) ? obj.bio : 'No bio found.';
                var additionalClass = (i == 0) ? 'senior-officers__item--active' : '';

                // Basic details
                newHTML = newHTML + `
                    <div class="senior-officers__item ${ additionalClass }" data-id="${i}" onclick="selectSeniorOfficer(${i});">
                        <div class="senior-officers__item-name">${obj.name}</div>
                        <div class="senior-officers__item-rank">${obj.rank}</div>
                    </div>
                `;

            }

            selectSeniorOfficer(0);

            // Update DOM
            document.getElementById('SO-container').innerHTML = newHTML;

        } else {

            // No senior officer details
            newHTML = '<p>No data available at this moment.</p>'

            // Update DOM
            document.getElementById('SO-wrapper').innerHTML = newHTML;
        }


    }
};

function selectSeniorOfficer(id) {

    // Update classes on items
    var items = document.getElementsByClassName("senior-officers__item");
    for (var i = 0; i < items.length; i++) {
        thisItem = items[i];
        thisItem.classList.remove('senior-officers__item--active');
        if (thisItem.dataset.id == id) {
            thisItem.classList.add('senior-officers__item--active');
        }
    }

    // Update HTML
    document.getElementById('SO-details').innerHTML = `
        <h3>${seniorOfficers[id].name}, ${seniorOfficers[id].rank}</h3>
        ${seniorOfficers[id].bio}
    `;
}