



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
        
        const formData = new FormData(weather_form);

        for (let [key, value] of formData.entries()) {
            console.log(key, value);

            if (key == "city_select1") {
                city1 = value;
            } else if (key == "state_select1") {
                state1 = value;
            }  else if (key == "city_select2") {
                city2 = value;
            }  else if (key == "state_select2") {
                state2 = value;
            } else if (key == "temp_type") {
                temp_type = value;
            }
        }
    });
}