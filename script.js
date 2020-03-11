$('container').style.visibility = 'hidden'
updateGetWeatherButton()
$('city').addEventListener('input', updateGetWeatherButton)
$('city').addEventListener('keyup', (event) => {
  if (event.key === 'Enter' && !cityTextFieldIsEmpty()) {
    getOpenWeatherMapWeather()
  }
})

function $(id) {
  return document.getElementById(id)
}

function cityTextFieldIsEmpty() {
  return $('city').value.trim().length == 0
}

function updateGetWeatherButton() {
  const cityTextFieldIsEmpty = $('city').value.trim().length == 0
  const getWeatherButton = $('getWeatherButton')
  const buttonEnabledColor = getComputedStyle(document.documentElement).getPropertyValue('--buttonEnabled')
  const buttonDisabledColor = getComputedStyle(document.documentElement).getPropertyValue('--buttonDisabled')
  getWeatherButton.disabled = cityTextFieldIsEmpty
  getWeatherButton.style.backgroundColor = cityTextFieldIsEmpty ? buttonDisabledColor : buttonEnabledColor
}

function getOpenWeatherMapWeather() {
  // OpenWeatherMap request values
  const OPENWEATHERMAP_URL = 'http://api.openweathermap.org/data/2.5/weather'
  const API_KEY = '06db44f389d2172e9b1096cdce7b051c'
  
  // HTTP status codes
  const HTTP_NOT_FOUND = 404

  const isHTTPSuccess = (value) => { 
    const HTTP_SUCCESS_LOWER_BOUND = 200
    const HTTP_SUCCESS_UPPER_BOUND = 299

    return value >= HTTP_SUCCESS_LOWER_BOUND && 
           value <= HTTP_SUCCESS_UPPER_BOUND 
  }

  const isHTTPServerError = (value) => {
    const HTTP_SERVER_ERROR_LOWER_BOUND = 500
    const HTTP_SERVER_ERROR_UPPER_BOUND = 599

    return value >= HTTP_SERVER_ERROR_LOWER_BOUND && 
           value <= HTTP_SERVER_ERROR_UPPER_BOUND 
  }
  
  // Error codes
  const NETWORK_UNAVAILABLE = 'TypeError: Failed to fetch'


  $('error_message').innerText = ''
  $('container').style.visibility = 'hidden'

  const location = $('city').value
  const requestURL = `${OPENWEATHERMAP_URL}?q=${location}&APPID=${API_KEY}`
  fetch(requestURL)
    .then(response => response.json())
    .then(data => {
      const responseCode = data.cod
      if (isHTTPSuccess(responseCode)) {
        // Success! We connected to OpenWeatherMap *and*
        // got weather data.
        displayWeather(data)

      } else {
        if (responseCode == HTTP_NOT_FOUND) {
          // Failure. We connected to OpenWeatherMap, *but*
          // couldn’t get weather data, probably because
          // the city provided wasn’t recognized.
          displayCityNotFound(location) 

        } else if (isHTTPServerError(responseCode)) {
          // Failure. The OpenWeatherMap server is experiencing
          // problems and can’t fulfill requests.
          displayServerError()

        } else {
          // Failure. Something unexpected happened on the server end.
          displayUnusualServerError(responseCode)
        }
      }
    })
    .catch(error => {
      if (error == NETWORK_UNAVAILABLE) {
        // Failure. We can’t even access the ’net.
        displayNetworkError()

      } else {
        // Failure. Something unexpected happened on the client end.
        displayClientError(error)
      }
    })
}


// Display functions
// -----------------
// These functions display the weather for the city entered by the user or
// an appropriate error message.

function displayWeather(data) {
  const weather = data.weather[0]
  const main = data.main
  const wind = data.wind
  const sys = data.sys
  const city = data.name
  const countryCode = sys.country
  
  $('container').style.visibility = 'visible'
	$('description').innerText = `${weather.description}`.toUpperCase()
  $('current_temp').innerHTML = formattedTemperature(main.temp)
  $('feels_like').innerHTML = formattedTemperature(main.feels_like)
  $('location').innerHTML = formattedLocation(city, countryCode)
  $('weather_icon').src = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`
  $('wind').innerText = formattedWindSpeed(wind.speed, wind.deg)
  $('wind_description').innerText = formattedWindDescription(wind.speed)
  $('humidity').innerText = formattedHumidity(main.humidity)
}

function displayCityNotFound(city) {
  $('error_message').innerHTML = `We’ve never heard of a place called “${city}.” Please try again.`
}

function displayNetworkError() {
  $('error_message').innerHTML = `<strong>Your internet connection is down.</strong> Please check your connection, or try again later.`;
}

function displayServerError() {
  $('error_message').innerHTML = `<strong>The weather server is down.</strong> Please try again later.`;
}

function displayAuthenticationProblem() {
  $('error_message').innerHTML = '<strong>Authentication error:</strong> OpenWeatherMap says that we’re using an invalid API key.'
}

function displayClientError(error) {
  $('error_message').innerHTML = `<strong>Internal error:</strong> ${error}`;
}

function displayUnusualServerError() {
  $('error_message').innerHTML = `<strong>Something unusual is happening with the weather server.</strong> Please try again later.`;
}


// OpenWeatherMap utility functions
// --------------------------------
// These functions are used by displayWeather() to convert OpenWeatherMap data
// into more easily understood units or to format them for display.

function kelvinToCelsius(tempInKelvin) {
  return Math.round(parseFloat(tempInKelvin) - 273.15)
}

function kelvinToFahrenheit(tempInKelvin) {
  return Math.round(((parseFloat(tempInKelvin) - 273.15) * 1.8 ) + 32)
}

function formattedTemperature(tempInKelvin) {
  return `${kelvinToFahrenheit(tempInKelvin)}&deg; F / ${kelvinToCelsius(tempInKelvin)}&deg; C`
}

function degreesToCardinalDirection(degrees) {
  const NUMBER_OF_SECTORS = 16
  const DEGREES_PER_SECTOR = 360 / NUMBER_OF_SECTORS
  const CARDINAL_DIRECTIONS = [
    "N", "NNE", "NE", 
    "ENE", "E", "ESE", 
    "SE", "SSE", "S", "SSW", "SW", 
    "WSW", "W", "WNW", "NW", "NNW"
  ];
  const sector = Math.floor((degrees / DEGREES_PER_SECTOR) + 0.5);
  return CARDINAL_DIRECTIONS[(sector % NUMBER_OF_SECTORS)];
}

const SECONDS_PER_HOUR = 3600.0

function metersPerSecondToMilesPerHour(meterspersecond) {
  const METERS_PER_MILE = 1609.3
  return Math.round(meterspersecond * SECONDS_PER_HOUR / METERS_PER_MILE)
}

function metersPerSecondToKilometersPerHour(meterspersecond) {
  const METERS_PER_KILOMETER = 1000.0
  return Math.round(meterspersecond * SECONDS_PER_HOUR / METERS_PER_KILOMETER)
}

function formattedWindSpeed(speed, angle) {
  const formattedSpeedMiles = metersPerSecondToMilesPerHour(speed)
  const formattedSpeedKilometers = metersPerSecondToKilometersPerHour(speed)
  const direction = degreesToCardinalDirection(angle)
  return `${formattedSpeedMiles} mph / ${formattedSpeedKilometers} km/h ${direction}`
}

function windSpeedToBeaufortScale(windSpeed) {
  const speed = metersPerSecondToMilesPerHour(windSpeed)
  let scale = 0

  if (speed >= 1 && speed <= 3) {
    scale = 1
  } else if (speed <= 7) {
    scale = 2
  } else if (speed <= 12) {
    scale = 3
  } else if (speed <= 18) {
    scale = 4
  } else if (speed <= 24) {
    scale = 5
  } else if (speed <= 31) {
    scale = 6
  } else if (speed <= 38) {
    scale = 7
  } else if (speed <= 46) {
    scale = 8
  } else if (speed <= 54) {
    scale = 9
  } else if (speed <= 63) {
    scale = 10
  } else if (speed <= 72) {
    scale = 11
  } else {
    scale = 12
  }

  return scale
}

function beaufortScaleToDescription(beaufortScale) {
  const descriptions = [
    'Calm',
    'Light air',
    'Light breeze',
    'Gentle breeze',
    'Moderate breeze',
    'Fresh breeze',
    'Stong breeze',
    'Moderate gale',
    'Fresh gale',
    'Strong gale',
    'Whole gale',
    'Violent storm',
    'Hurricane'
  ]

  return descriptions[beaufortScale]
}

function formattedWindDescription(windSpeed) {
  return beaufortScaleToDescription(windSpeedToBeaufortScale(windSpeed))
}

function formattedLocation(city, countryCode) {
  return `${city}, ${countryName(countryCode)}`
}

function weatherIconImgTag(weatherIcon, altText) {
  return `<img src="http://openweathermap.org/img/wn/${weatherIcon}@2x.png" alt="${altText}>"`
}

function formattedHumidity(humidity) {
  return `${humidity}%`
}

function countryName(countryCode) {
  var isoCountries = {
    'AF' : 'Afghanistan',
    'AX' : 'Aland Islands',
    'AL' : 'Albania',
    'DZ' : 'Algeria',
    'AS' : 'American Samoa',
    'AD' : 'Andorra',
    'AO' : 'Angola',
    'AI' : 'Anguilla',
    'AQ' : 'Antarctica',
    'AG' : 'Antigua And Barbuda',
    'AR' : 'Argentina',
    'AM' : 'Armenia',
    'AW' : 'Aruba',
    'AU' : 'Australia',
    'AT' : 'Austria',
    'AZ' : 'Azerbaijan',
    'BS' : 'Bahamas',
    'BH' : 'Bahrain',
    'BD' : 'Bangladesh',
    'BB' : 'Barbados',
    'BY' : 'Belarus',
    'BE' : 'Belgium',
    'BZ' : 'Belize',
    'BJ' : 'Benin',
    'BM' : 'Bermuda',
    'BT' : 'Bhutan',
    'BO' : 'Bolivia',
    'BA' : 'Bosnia And Herzegovina',
    'BW' : 'Botswana',
    'BV' : 'Bouvet Island',
    'BR' : 'Brazil',
    'IO' : 'British Indian Ocean Territory',
    'BN' : 'Brunei Darussalam',
    'BG' : 'Bulgaria',
    'BF' : 'Burkina Faso',
    'BI' : 'Burundi',
    'KH' : 'Cambodia',
    'CM' : 'Cameroon',
    'CA' : 'Canada',
    'CV' : 'Cape Verde',
    'KY' : 'Cayman Islands',
    'CF' : 'Central African Republic',
    'TD' : 'Chad',
    'CL' : 'Chile',
    'CN' : 'China',
    'CX' : 'Christmas Island',
    'CC' : 'Cocos (Keeling) Islands',
    'CO' : 'Colombia',
    'KM' : 'Comoros',
    'CG' : 'Congo',
    'CD' : 'Congo, Democratic Republic',
    'CK' : 'Cook Islands',
    'CR' : 'Costa Rica',
    'CI' : 'Cote D\'Ivoire',
    'HR' : 'Croatia',
    'CU' : 'Cuba',
    'CY' : 'Cyprus',
    'CZ' : 'Czech Republic',
    'DK' : 'Denmark',
    'DJ' : 'Djibouti',
    'DM' : 'Dominica',
    'DO' : 'Dominican Republic',
    'EC' : 'Ecuador',
    'EG' : 'Egypt',
    'SV' : 'El Salvador',
    'GQ' : 'Equatorial Guinea',
    'ER' : 'Eritrea',
    'EE' : 'Estonia',
    'ET' : 'Ethiopia',
    'FK' : 'Falkland Islands (Malvinas)',
    'FO' : 'Faroe Islands',
    'FJ' : 'Fiji',
    'FI' : 'Finland',
    'FR' : 'France',
    'GF' : 'French Guiana',
    'PF' : 'French Polynesia',
    'TF' : 'French Southern Territories',
    'GA' : 'Gabon',
    'GM' : 'Gambia',
    'GE' : 'Georgia',
    'DE' : 'Germany',
    'GH' : 'Ghana',
    'GI' : 'Gibraltar',
    'GR' : 'Greece',
    'GL' : 'Greenland',
    'GD' : 'Grenada',
    'GP' : 'Guadeloupe',
    'GU' : 'Guam',
    'GT' : 'Guatemala',
    'GG' : 'Guernsey',
    'GN' : 'Guinea',
    'GW' : 'Guinea-Bissau',
    'GY' : 'Guyana',
    'HT' : 'Haiti',
    'HM' : 'Heard Island & Mcdonald Islands',
    'VA' : 'Holy See (Vatican City State)',
    'HN' : 'Honduras',
    'HK' : 'Hong Kong',
    'HU' : 'Hungary',
    'IS' : 'Iceland',
    'IN' : 'India',
    'ID' : 'Indonesia',
    'IR' : 'Iran, Islamic Republic Of',
    'IQ' : 'Iraq',
    'IE' : 'Ireland',
    'IM' : 'Isle Of Man',
    'IL' : 'Israel',
    'IT' : 'Italy',
    'JM' : 'Jamaica',
    'JP' : 'Japan',
    'JE' : 'Jersey',
    'JO' : 'Jordan',
    'KZ' : 'Kazakhstan',
    'KE' : 'Kenya',
    'KI' : 'Kiribati',
    'KR' : 'Korea',
    'KW' : 'Kuwait',
    'KG' : 'Kyrgyzstan',
    'LA' : 'Lao People\'s Democratic Republic',
    'LV' : 'Latvia',
    'LB' : 'Lebanon',
    'LS' : 'Lesotho',
    'LR' : 'Liberia',
    'LY' : 'Libyan Arab Jamahiriya',
    'LI' : 'Liechtenstein',
    'LT' : 'Lithuania',
    'LU' : 'Luxembourg',
    'MO' : 'Macao',
    'MK' : 'Macedonia',
    'MG' : 'Madagascar',
    'MW' : 'Malawi',
    'MY' : 'Malaysia',
    'MV' : 'Maldives',
    'ML' : 'Mali',
    'MT' : 'Malta',
    'MH' : 'Marshall Islands',
    'MQ' : 'Martinique',
    'MR' : 'Mauritania',
    'MU' : 'Mauritius',
    'YT' : 'Mayotte',
    'MX' : 'Mexico',
    'FM' : 'Micronesia, Federated States Of',
    'MD' : 'Moldova',
    'MC' : 'Monaco',
    'MN' : 'Mongolia',
    'ME' : 'Montenegro',
    'MS' : 'Montserrat',
    'MA' : 'Morocco',
    'MZ' : 'Mozambique',
    'MM' : 'Myanmar',
    'NA' : 'Namibia',
    'NR' : 'Nauru',
    'NP' : 'Nepal',
    'NL' : 'Netherlands',
    'AN' : 'Netherlands Antilles',
    'NC' : 'New Caledonia',
    'NZ' : 'New Zealand',
    'NI' : 'Nicaragua',
    'NE' : 'Niger',
    'NG' : 'Nigeria',
    'NU' : 'Niue',
    'NF' : 'Norfolk Island',
    'MP' : 'Northern Mariana Islands',
    'NO' : 'Norway',
    'OM' : 'Oman',
    'PK' : 'Pakistan',
    'PW' : 'Palau',
    'PS' : 'Palestinian Territory, Occupied',
    'PA' : 'Panama',
    'PG' : 'Papua New Guinea',
    'PY' : 'Paraguay',
    'PE' : 'Peru',
    'PH' : 'Philippines',
    'PN' : 'Pitcairn',
    'PL' : 'Poland',
    'PT' : 'Portugal',
    'PR' : 'Puerto Rico',
    'QA' : 'Qatar',
    'RE' : 'Reunion',
    'RO' : 'Romania',
    'RU' : 'Russian Federation',
    'RW' : 'Rwanda',
    'BL' : 'Saint Barthelemy',
    'SH' : 'Saint Helena',
    'KN' : 'Saint Kitts And Nevis',
    'LC' : 'Saint Lucia',
    'MF' : 'Saint Martin',
    'PM' : 'Saint Pierre And Miquelon',
    'VC' : 'Saint Vincent And Grenadines',
    'WS' : 'Samoa',
    'SM' : 'San Marino',
    'ST' : 'Sao Tome And Principe',
    'SA' : 'Saudi Arabia',
    'SN' : 'Senegal',
    'RS' : 'Serbia',
    'SC' : 'Seychelles',
    'SL' : 'Sierra Leone',
    'SG' : 'Singapore',
    'SK' : 'Slovakia',
    'SI' : 'Slovenia',
    'SB' : 'Solomon Islands',
    'SO' : 'Somalia',
    'ZA' : 'South Africa',
    'GS' : 'South Georgia And Sandwich Isl.',
    'ES' : 'Spain',
    'LK' : 'Sri Lanka',
    'SD' : 'Sudan',
    'SR' : 'Suriname',
    'SJ' : 'Svalbard And Jan Mayen',
    'SZ' : 'Swaziland',
    'SE' : 'Sweden',
    'CH' : 'Switzerland',
    'SY' : 'Syrian Arab Republic',
    'TW' : 'Taiwan',
    'TJ' : 'Tajikistan',
    'TZ' : 'Tanzania',
    'TH' : 'Thailand',
    'TL' : 'Timor-Leste',
    'TG' : 'Togo',
    'TK' : 'Tokelau',
    'TO' : 'Tonga',
    'TT' : 'Trinidad And Tobago',
    'TN' : 'Tunisia',
    'TR' : 'Turkey',
    'TM' : 'Turkmenistan',
    'TC' : 'Turks And Caicos Islands',
    'TV' : 'Tuvalu',
    'UG' : 'Uganda',
    'UA' : 'Ukraine',
    'AE' : 'United Arab Emirates',
    'GB' : 'United Kingdom',
    'US' : 'United States',
    'UM' : 'United States Outlying Islands',
    'UY' : 'Uruguay',
    'UZ' : 'Uzbekistan',
    'VU' : 'Vanuatu',
    'VE' : 'Venezuela',
    'VN' : 'Viet Nam',
    'VG' : 'Virgin Islands, British',
    'VI' : 'Virgin Islands, U.S.',
    'WF' : 'Wallis And Futuna',
    'EH' : 'Western Sahara',
    'YE' : 'Yemen',
    'ZM' : 'Zambia',
    'ZW' : 'Zimbabwe'
  };

  if (isoCountries.hasOwnProperty(countryCode)) {
      return isoCountries[countryCode];
  } else {
      return countryCode;
  }
}
