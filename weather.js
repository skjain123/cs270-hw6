document.addEventListener('DOMContentLoaded', function () {
    console.log("document loaded");

    get_user_input()
});

// clear the table holder's child elements
function clear_tableholder () {
    let elem = document.getElementById("table_holder"); 
    while (elem.firstChild) { 
        elem.removeChild(elem.firstChild); 
        elem.firstChild.remove(); 
    }
}

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
        clear_tableholder();
        
        // get user input form
        const form_data = new FormData(weather_form);

        for (let [key, value] of form_data.entries()) {
            console.log(key, value);

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

        // call api links and pass through the cities and states user inputted 
        call_api(api1, api2, city1, state1, city2, state2);
    });
}

function call_api(api1, api2, city1, state1, city2, state2) {
    fetch(api1) // call the first api link
    .then(response => {
        if (!response.ok) { // bad
            throw new Error('Response was not ok');
        }
        return response.json();
    })
    .then(data1 => { // good
        print_data(data1, city1, state1);
        return fetch(api2); // call the second api link
    })
    .then(response => { 
        if (!response.ok) { // bad for second
            throw new Error('Response was not ok');
        }
        return response.json();
    })
    .then(data2 => { // good for second
        print_data(data2, city2, state2);
    })
    .catch(error => { // error
        console.error('Error:', error);
    });
}

function setup_table (table_holder, city, state) {
    table_holder.append(document.createElement("br")); // spacing 
    table_holder.append(document.createElement("br"));


    const table_title = document.createElement("h1"); // creates a header to display the location
    table_title.textContent = city + ", " + state;
    table_holder.append(table_title);


    const new_table = document.createElement("table"); //create table
    
    const headers = ['Day', 'High', 'Low', 'Outlook'];
    headers.forEach(header_text => { // for each header, create a row
        const header = document.createElement('tr');
        header.textContent = header_text; // populate row with the header
        new_table.appendChild(header)
    });

    // display table to the screen
    table_holder.appendChild(new_table); 

    return new_table;
}

function insert_data (new_table, row_num, text_content) {
    const rows = new_table.getElementsByTagName("tr"); // get the table rows

    const new_data = document.createElement("td"); // create new data
    new_data.textContent = text_content; 
    rows[row_num].appendChild(new_data); // fill and append that data to the row
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function print_data (curr_data, city, state) {

    let counter = 0;
    let output = "";

    let low_temp = 9999;
    let high_temp = 0;

    const table_holder = document.getElementById("table_holder"); // get the table holder

    const new_table = setup_table(table_holder, city, state); // set up the table title and first column
    
    const rows = new_table.getElementsByTagName("tr"); // get all table rows

    let weather_arr = [];
    let weather_count = [];

    for (elem of curr_data.list) {

        // find the lowest temperature of the day
        if (low_temp > elem.main.temp_max) {
            low_temp = elem.main.temp_min;
        }

        // find the highest temperature of the day
        if (high_temp < elem.main.temp_max) {
            high_temp = elem.main.temp_max;
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
            
            const date = new Date(elem.dt_txt);

            // add the day of the week, highest temp, lowest temp for each day
            insert_data(new_table, 0, days[date.getDay()]);
            insert_data(new_table, 1, high_temp);
            insert_data(new_table, 2, low_temp);

            // add the icon image to the table outlook
            outlook = document.createElement("td");
            new_img = document.createElement("img");
            new_img.src = `./img/${weather_arr[highest_index]}.png`;
            outlook.appendChild(new_img);
            rows[3].appendChild(outlook);


            // reset variables per day
            counter = 0;
            low_temp = 9999;
            high_temp = 0;
            weather_arr = [];
            weather_count = {};
        } else {
            counter++;
        }
    }
}