



document.addEventListener('DOMContentLoaded', function () {
    console.log("document loaded");

    get_user_input()
});

function get_user_input () {

    let city1 = "blank";
    let state1 = 0;

    let city2 = "blank";
    let state2 = 0;

    let temp_type = "blank";

    const weather_form = document.getElementById("weather_form");
    weather_form.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const form_data = new FormData(weather_form);

        for (let [key, value] of form_data.entries()) {
            console.log(key, value);

            city1 = form_data.get("city_select1");
            state1 = form_data.get("state_select1");
            city2 = form_data.get("city_select2");
            state2 = form_data.get("state_select2");
            temp_type = form_data.get("temp_type");
        }

        console.log(city1 + "," + state1 + "first");
        console.log(city2 + "," + state2 + "second");

        let unit_type = "imperial";

        /* console.log("temperature type: " + temp_type); */
        if (temp_type == "Fahrenheit") {
            unit_type = "imperial";
        } else if (temp_type == "Celsius") {
            unit_type = "metric"
        }

        const apiKey = "58fe1e5a3b9d72c1a3709b07ab2cca44";
        const call_api1 = "http://api.openweathermap.org/data/2.5/forecast?q=" + city1 + "," + state1 + ",US&limit=1&appid=" + apiKey + "&units=" + unit_type;
        const call_api2 = "http://api.openweathermap.org/data/2.5/forecast?q=" + city2 + "," + state2 + ",US&limit=1&appid=" + apiKey + "&units=" + unit_type;

        let loc1_data = 0;
        let loc2_data = 0;

        fetch(call_api1)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Response was not ok');
                }
                //console.log(response.json());
                return response.json();
            })
            .then(data1 => {
                print_data(data1);
                return fetch(call_api2);
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Response was not ok');
                }
                return response.json();
            })
            .then(data2 => {
                print_data(data2);
            })
            .catch(error => {
                console.error('Error:', error);
            });

            /* console.log("get the name of place: " + data2.get("name")); */



    });
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
function print_data (curr_data) {
    /* console.log("print data test: " + JSON.stringify(curr_data)); */

    console.log("");
    console.log("in print_data()");

    /* for (elem of curr_data.list) {
        console.log(elem.main.temp);
    } */
    

    let counter = 0;
    let output = "";

    let low_temp = 9999;
    let high_temp = 0;

    const newTable = document.createElement("table");
    const table_holder = document.getElementById("table_holder");
    table_holder.appendChild(newTable);

    const newRow = document.createElement("tr");
    newTable.appendChild(newRow);

    const newElem = document.createElement("th");
    newElem.textContent = "test";
    newTable.appendChild(newRow);


    for (elem of curr_data.list) {
        console.log(elem.dt_txt + " " + elem.main.temp);

        if (low_temp > elem.main.temp) {
            low_temp = elem.main.temp;
        }

        if (high_temp < elem.main.temp) {
            high_temp = elem.main.temp;
        }

        if (counter == 7) {
            console.log("---------------");
            const date = new Date(elem.dt_txt);
            console.log(days[date.getDay()]);
            console.log("low: " + low_temp);
            console.log("high: " + high_temp);

            counter = 0;

            

            /* newTable.appendChild(); */

            low_temp = 9999;
            high_temp = 0;
        } else {
            counter++;
        }
    }
}