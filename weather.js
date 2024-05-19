/* 
Name: Sunil Jain
Date: 5/19/24
Course: Intro to Web Development = CS290
Professor: Prof. Coffman
*/

// when the document loads, do this
document.addEventListener('DOMContentLoaded', function () {
    // get the user input
    get_user_input()
});

// clear the child elements of whatever element of the specified id 
function clear_children (input) {
    let elem = document.getElementById(input);

    if (elem) {
        while (elem.firstChild) { 
            elem.removeChild(elem.firstChild);
        }
    }
}

// sets the form submission's submit functionality-- gets user input and uses it for api calls.
function get_user_input () {

    // default values for the first location
    let city1 = "blank";
    let state1 = 0;

    // default values for the second location
    let city2 = "blank";
    let state2 = 0;

    // default values for the unit type
    let temp_type = "blank";

    // check for user submission
    const weather_form = document.getElementById("weather_form");
    weather_form.addEventListener("submit", function(event) {
        event.preventDefault();

        // clear table_holder child elements
        clear_children("table_holder");
        clear_children("error_display1");
        clear_children("error_display2");
        
        // get user input form
        const form_data = new FormData(weather_form);

        for (let [key, value] of form_data.entries()) {
            /* console.log(key, value); */

            // get user data
            city1 = form_data.get("city_select1");
            state1 = form_data.get("state_select1");
            city2 = form_data.get("city_select2");
            state2 = form_data.get("state_select2");
            temp_type = form_data.get("temp_type");
        }

        // default type is imperial units
        let unit_type = "imperial";

        // decides what measurements to pull in the api keys below
        if (temp_type == "Fahrenheit") {
            unit_type = "imperial";
        } else if (temp_type == "Celsius") {
            unit_type = "metric"
        }
        
        // api key from my account on openweathermap
        const apiKey = "58fe1e5a3b9d72c1a3709b07ab2cca44";

        // first location api call link
        const api1 = "http://api.openweathermap.org/data/2.5/forecast?q=" + city1 + "," + state1 + ",US&limit=1&appid=" + apiKey + "&units=" + unit_type;
        
        // second location api call link
        const api2 = "http://api.openweathermap.org/data/2.5/forecast?q=" + city2 + "," + state2 + ",US&limit=1&appid=" + apiKey + "&units=" + unit_type;

        // call api link 1 if the user inputted a city, if they didnt, display a error message to the screen
        if (city1.length > 0) {
            call_api(api1, city1, state1);
        } else {
            insert_error(" Enter a city ", "error_display1");
        }
        
        // call api link 2 if the user inputted a city, if they didnt, display a error message to the screen
        if (city2.length > 0) {
            call_api(api2, city2, state2);
        } else {
            insert_error(" Enter a city ", "error_display2");
        }
    });
}

// inserts a red paragraph that displays an error when the user does not input a city
function insert_error(message, input_id) {
    const error_elem = document.createElement('p'); // create display element
    
    // set the content, color to red, remove the newline character, and mark it to be removed.
    error_elem.textContent = message; 
    error_elem.style.color = "red";
    error_elem.style.display = "inline"
    error_elem.id = "to_remove";
    
    const input_elem = document.getElementById(input_id);
    input_elem.append(error_elem);
}

// fetches api, handles good and bad cases -- good: create table, bad-display a red error message
function call_api(api_link, city, state) {
    fetch(api_link) // call the first api link
    .then(response => {
        if (!response.ok) { // bad
            throw new Error('Response was not ok');
        }
        return response.json();
    })
    .then(data => { // good
        print_data(data, city, state); // create table
    })
    .catch(error => { // error
        display_not_found(city, state); // display red error message
    });
}

// displays a red error message instead of creating a table.
function display_not_found(city, state) {
    const new_display = document.createElement("p");
    new_display.textContent = `Unable to locate ${city}, ${state}`
    new_display.style.color = "red";

    const table_display = document.getElementById("table_holder");
    table_holder.append(new_display);
}

// sets up the table by creating the first columns, defining the variables in the table. Also creates the table title
function setup_table (table_holder, city, state) {
    table_holder.append(document.createElement("br")); // spacing 
    /* table_holder.append(document.createElement("br")); */

    const table_title = document.createElement("h1"); // creates a header to display the location
    table_title.textContent = city + ", " + state;
    table_holder.append(table_title);


    const new_table = document.createElement("table"); //create table
    
    const headers = ['Day', 'High', 'Low', 'Rainfall', 'Outlook'];
    headers.forEach(header_text => { // for each header, create a row
        const header = document.createElement('tr');
        header.textContent = header_text; // populate row with the header
        new_table.appendChild(header)
    });

    // display table to the screen
    table_holder.appendChild(new_table); 

    return new_table;
}

// inserts the data in to the specified table row
function insert_data (new_table, row_num, text_content) {
    const rows = new_table.getElementsByTagName("tr"); // get the table rows

    const new_data = document.createElement("td"); // create new data
    new_data.textContent = text_content; 
    rows[row_num].appendChild(new_data); // fill and append that data to the row
}

// creates a full table in the case that the user inputted a good location
function print_data (curr_data, city, state) {

    // formatting the data_txt api fetch to the days of the week
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // count every 8 because the api updates every 3 hrs (3 hrs * 8 = 24 hrs = 1 day)
    let counter = 0;

    // for getting the lowest/highest temp in a day, and getting the total rain in the day.
    let low_temp = 9999;
    let high_temp = 0;
    let total_rain = 0;

    // get the div that contains tables
    const table_holder = document.getElementById("table_holder"); // get the table holder

    // create new table and its first data column
    const new_table = setup_table(table_holder, city, state); // set up the table title and first column
    
    // get all the rows to insert data into by day
    const rows = new_table.getElementsByTagName("tr"); // get all table rows

    // for counting the weather occurrances to decide what the outlook is today.
    let weather_arr = [];
    let weather_count = [];

    // go through all the 3hr-interval data
    for (elem of curr_data.list) {

        // find the lowest temperature of the day
        if (low_temp > elem.main.temp_max) {
            low_temp = elem.main.temp_min;
        }

        // find the highest temperature of the day
        if (high_temp < elem.main.temp_max) {
            high_temp = elem.main.temp_max;
        }

        // add rain if there is rain
        if (elem.rain && elem.rain["3h"]) {
            total_rain += elem.rain["3h"];
        }

        // find the most occurring weather condition in the day
        if (weather_arr.indexOf(elem.weather[0].icon) != -1) {
            weather_count[weather_arr.indexOf(elem.weather[0].icon)] += 1;
        } else {
            weather_arr.push(elem.weather[0].icon);
            weather_count[weather_arr.indexOf(elem.weather[0].icon)] = 1;
        }

        if (counter == 7) { // api updates every 3 hrs, this prints data per day.
            // find the most occurring weather condition
            let highest_index = 0;
            for (let i = 0; i < weather_count.length; i++) {
                if (weather_count[highest_index] < weather_count[i]) {
                    highest_index = i;
                }
            }
            
            // for formatting  dt_txt -> days of the week
            const date = new Date(elem.dt_txt);

            // add the day of the week, highest temp, lowest temp for each day
            insert_data(new_table, 0, days[date.getDay()]);
            insert_data(new_table, 1, high_temp);
            insert_data(new_table, 2, low_temp);
            insert_data(new_table, 3, Math.round(total_rain * 100) / 100);

            // add the icon image to the table outlook
            outlook = document.createElement("td");
            new_img = document.createElement("img");
            new_img.src = `./img/${weather_arr[highest_index]}.png`;
            outlook.appendChild(new_img);
            rows[4].appendChild(outlook);


            // reset variables per day
            counter = 0;
            low_temp = 9999;
            high_temp = 0;
            weather_arr = [];
            weather_count = {};
        } else {
            // increment counter
            counter++;
        }
    }
}