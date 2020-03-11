# VanillaJSWeatherDemo
A simple OpenWeatherMap-based web app in vanilla JavaScript

![Weather app displaying the weather for Ouagoudougou, Burkina Faso](http://www.globalnerdy.com/wp-content/uploads/2020/03/weather-app.png)

## The assignment
This app is my submission for an assignment to create a front-end web app using “vanilla JavaScript” — namely, using only JavaScript
with jQuery or any other libraries. The user should be presented with a text input, where they enter the name of a city or town.
The app should use the [OpenWeatherMap](https://openweathermap.org/) API to retrieve the weather for the city or town entered by the user.

Other requirements for this assignment:
* The app should make its ajax requests using [`fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch).
* Layout should be implemented using [Flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox/) or [Grid](https://css-tricks.com/snippets/css/complete-guide-grid/).

The application can optionally display an icon representing the current weather conditions.

My implementation adds a couple of features:
* It displays both the name of the city and the full name of country for the forecast location.
* It displays quantities in both Imperial and metric units.
* It displays the “feels like” temperature.
* It displays information about the wind — the speed expressed in both miles and kilometers per hour, a description of the wind, and the direction (remember,
wind direction is specified as the direction that the wind is coming *from*).
* It displays the humidity.

The app also has some basic error handling. It handles the case where the user enters the name of a city or town that OpenWeatherMap
doesn’t recognize:

![Weather app displaying an error message for a city it doesn’t recognize](http://www.globalnerdy.com/wp-content/uploads/2020/03/weather-app-unknown-city.png)

It also handles cases where an internet connection is not available:

![Weather app displaying an error message for no internet connection](http://www.globalnerdy.com/wp-content/uploads/2020/03/weather-app-no-internet.png)

It even handles cases where OpenWeatherMap’s servers return an error message.


