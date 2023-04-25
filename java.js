$(document).ready(function () {

    // OpenWeather API
    var apiKey = '6eab19e4a9d75aa57c250feef3be7cfb';

    // Selectors for HTML elements to display weather information
    var cityEl = $('#city');
    var dateEl = $('#date');
    var weatherIconEl = $('#weather-icon');
    var temperatureEl = $('#temperature');
    var humidityEl = $('#humidity');
    var windEl = $('#wind');
    var cityListEl = $('div.cityList');

   // Selectors for form elements
   var cityInput = $('#city-input');

   // Past cities
   var pastCities = [];


    // Load events from local storage
    function loadCities() {
        var storedCities = JSON.parse(localStorage.getItem('pastCities'));
        if (storedCities) {
            pastCities = storedCities;
        }
    }

    // Store searched cities in local storage
    function storeCities() {
        localStorage.setItem('pastCities', JSON.stringify(pastCities));
    }

   // API call
 
    function buildURLFromInputs(city) {
        if (city) {
            return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        }
    }

    function buildURLFromId(id) {
        return `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}`;
    }

     // Function to display the last 5 searched cities
     function displayCities(pastCities) {
        cityListEl.empty();
        pastCities.splice(5);
        var sortedCities = [...pastCities];
        sortedCities.forEach(function (location) {
            var cityDiv = $('<div>').addClass('col-12 city');
            var cityBtn = $('<button>').addClass('btn btn-light city-btn').text(location.city);
            cityDiv.append(cityBtn);
            cityListEl.append(cityDiv);
        });
    }
    

    // Search for weather conditions by calling the OpenWeather API
    function searchWeather(queryURL) {

        // AJAX call to retrieve weather data
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (response) {

            // Store current city in past cities
            var city = response.name;
            var id = response.id;
            // Remove duplicate cities
            if (pastCities[0]) {
                pastCities = $.grep(pastCities, function (storedCity) {
                    return id !== storedCity.id;
                })
            }
            pastCities.unshift({ city, id });
            storeCities();
            displayCities(pastCities);
            
            // Display current weather
            cityEl.text(response.name);
            var formattedDate = moment.unix(response.dt).format('L');
            dateEl.text(formattedDate);
            var weatherIcon = response.weather[0].icon;
            weatherIconEl.attr('src', `http://openweathermap.org/img/wn/${weatherIcon}.png`).attr('alt', response.weather[0].description);
            temperatureEl.html(((response.main.temp - 273.15) * 1.8 + 32).toFixed(1));
            humidityEl.text(response.main.humidity);
            windEl.text((response.wind.speed * 2.237).toFixed(1));

            //API Call 5 day forecast
            $.ajax({
                url: queryURL,
                method: 'GET'
            }).then(function (response) {
                var fiveDay = response.daily;

                for (var i = 0; i <= 5; i++) {
                    var currDay = fiveDay[i];
                    $(`div.day-${i} .card-title`).text(moment.unix(currDay.dt).format('L'));
                    $(`div.day-${i} .fiveDay-img`).attr(
                        'src',
                        `http://openweathermap.org/img/wn/${currDay.weather[0].icon}.png`
                    ).attr('alt', currDay.weather[0].description);
                    $(`div.day-${i} .fiveDay-temp`).text(((currDay.temp.day - 273.15) * 1.8 + 32).toFixed(1));
                    $(`div.day-${i} .fiveDay-humid`).text(currDay.humidity);
                }
            });
        });
    }

     // Function last searched city
     function displayLastSearchedCity() {
        if (pastCities[0]) {
            var queryURL = buildURLFromId(pastCities[0].id);
            searchWeather(queryURL);
        } else {
            var queryURL = buildURLFromInputs("Dallas");
            searchWeather(queryURL);
        }
    }
 
    // Click event
    $('#search-btn').on('click', function (event) {
        event.preventDefault();
        var city = cityInput.val().trim();
        city = city.replace(' ', '%20');
        cityInput.val('');

        if (city) {
            var queryURL = buildURLFromInputs(city);
            searchWeather(queryURL);
        }
    }); 
    
    //City button
    $(document).on("click", "button.city-btn", function (event) {
        var clickedCity = $(this).text();
        var foundCity = $.grep(pastCities, function (storedCity) {
            return clickedCity === storedCity.city;
        })
        var queryURL = buildURLFromId(foundCity[0].id)
        searchWeather(queryURL);
    });


    // Load any cities in local storage 
    loadCities();
    displayCities(pastCities);

    // Display weather for last searched city
    displayLastSearchedCity();

});