function Weather(conf) {
  this.config = conf;
  this.lat = this.config.lat;
  this.lon = this.config.lon;
  this.appid = this.config.api_key;
  this.elt = document.getElementsByClassName(this.config.target)[0];
  this.wrapped = false;
  this.fdata = null; //forecast weather
  this.wdata = null; //current weather

  this.generate = async function() {
    if (this.config.provider === "openweathermap") {
      let furl = `http://api.openweathermap.org/data/2.5/forecast?lat=${
        this.lat
      }&lon=${this.lon}&units=${this.config.unit || "metric"}&cnt=5&appid=${
        this.appid
      }`;
      const fresponse = await fetch(furl).catch(error => console.error(error));
      this.fdata = await fresponse.json().catch(error => console.error(error));
      let wurl = furl.replace("forecast", "weather");
      const wresponse = await fetch(wurl).catch(error => console.error(error));
      this.wdata = await wresponse.json().catch(error => console.error(error));
      console.log(this.wdata);
      console.log(this.fdata);
    } else if (this.config.provider === "darksky") {
      let url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${
        this.appid
      }/${this.lat},${
        this.lon
      }/?exclude=minutely,daily,flags,alerts&units=${this.config.unit || "si"}`;
      const response = await fetch(url).catch(error => console.error(error));
      this.fdata = await response.json().catch(error => console.error(error));
      console.log(this.fdata);
    } else {
      console.error("Error invalid weather provider");
    }
  };

  this.renderOutput = function() {
    if (!this.wrapped) {
      let innerdiv = `<div class="component__weather-box">
      <div class="component__weather-content">
        <div class="weather-content__overview"></div>
        <div class="weather-content__temp"></div>
      </div>
      <div class="component__forecast-box"></div>
      </div>`;
      let wrapdiv = document.createElement("div");
      wrapdiv.setAttribute("id", "weather");
      wrapdiv.className = this.config.classlist;
      wrapdiv.innerHTML = innerdiv;
      this.elt.appendChild(wrapdiv);
      this.wrapped = true;
    }
    const CURRENT_LOCATION = document.getElementsByClassName(
      "weather-content__overview"
    )[0];
    const CURRENT_TEMP = document.getElementsByClassName(
      "weather-content__temp"
    )[0];
    const FORECAST = document.getElementsByClassName(
      "component__forecast-box"
    )[0];
    if (this.config.provider === "openweathermap") {
      const currentWeather = this.wdata.weather[0];
      let location = this.fdata.city;
      let forecast = this.fdata.list;
      const widgetHeader = `<h1>${location.name}</h1><small>${currentWeather.description}</small>`;
      CURRENT_TEMP.innerHTML = `<i class="wi ${this.applyIcon(
        currentWeather.icon
      )}"></i> ${Math.round(
        this.wdata.main.temp
      )} <i class="wi wi-degrees"></i>`;
      CURRENT_LOCATION.innerHTML = widgetHeader;
      //check for previous nodes..
      while (FORECAST.lastChild) {
        FORECAST.removeChild(FORECAST.lastChild);
      }
      // render each daily forecast
      forecast.forEach(daytime => {
        let date = new Date(daytime.dt * 1000);
        let time = `${date.getHours()}:${date.getMinutes()}`;

        let daytimeBlock = document.createElement("div");
        daytimeBlock.className = "forecast__item";
        daytimeBlock.innerHTML = `<div class="forecast-item__heading">${time}</div>
        <div class="forecast-item__info"><i class="wi ${this.applyIcon(
          daytime.weather[0].icon
        )}"></i> <span class="degrees">${Math.round(
          daytime.main.temp
        )}<i class="wi wi-degrees"></i></span></div>`;
        FORECAST.appendChild(daytimeBlock);
      });
    } else if (this.config.provider === "darksky") {
      const currentWeather = this.fdata.currently;
      let forecast = this.fdata.hourly.data;
      const widgetHeader = `<h1>Kerala</h1><small>${currentWeather.summary}</small>`;
      CURRENT_TEMP.innerHTML = `<i class="wi ${this.get_icon(
        currentWeather.icon
      )}"></i> ${Math.round(
        currentWeather.temperature
      )} <i class="wi wi-degrees"></i>`;
      CURRENT_LOCATION.innerHTML = widgetHeader;
      //check for previous nodes..
      while (FORECAST.lastChild) {
        FORECAST.removeChild(FORECAST.lastChild);
      }
      // render each daily forecast
      for (let i = 0; i <= 12; i += 3) {
        let date = new Date(forecast[i].time * 1000);
        let time = `${date.getHours()}:${date.getMinutes()}`;

        let daytimeBlock = document.createElement("div");
        daytimeBlock.className = "forecast__item";
        daytimeBlock.innerHTML = `<div class="forecast-item__heading">${time}</div>
        <div class="forecast-item__info"><i class="wi ${this.get_icon(
          forecast[i].icon
        )}"></i> <span class="degrees">${Math.round(
          forecast[i].temperature
        )}<i class="wi wi-degrees"></i></span></div>`;

        FORECAST.appendChild(daytimeBlock);
      }
    } else {
      console.error("error");
    }
  };

  this.renderUpdate = function() {
    this.generate().then(() => this.renderOutput());
  };

  this.render = function() {
    this.generate().then(() => this.renderOutput());

    setInterval(() => {
      this.renderUpdate();
    }, this.config.updateinterval * 60 * 1000);
  };
  //function for fetching icon in openweathermap
  this.applyIcon = function(icon) {
    let selectedIcon;
    switch (icon) {
      case "01d":
        selectedIcon = "wi-day-sunny";
        break;
      case "01n":
        selectedIcon = "wi-night-clear";
        break;
      case "02d":
      case "02n":
        selectedIcon = "wi-cloudy";
        break;
      case "03d":
      case "03n":
      case "04d":
      case "04n":
        selectedIcon = "wi-night-cloudy";
        break;
      case "09d":
      case "09n":
        selectedIcon = "wi-showers";
        break;
      case "10d":
      case "10n":
        selectedIcon = "wi-rain";
        break;
      case "11d":
      case "11n":
        selectedIcon = "wi-thunderstorm";
        break;
      case "13d":
      case "13n":
        selectedIcon = "wi-snow";
        break;
      case "50d":
      case "50n":
        selectedIcon = "wi-fog";
        break;
      default:
        selectedIcon = "wi-meteor";
    }
    return selectedIcon;
  };
  //function for fetching darksky icon
  this.get_icon = function(icon) {
    let selectedIcon;
    switch (icon) {
      case "clear-day":
        selectedIcon = "wi-day-sunny";
        break;
      case "clear-night":
        selectedIcon = "wi-night-clear";
        break;
      case "rain":
        selectedIcon = "wi-rain";
        break;
      case "snow":
        selectedIcon = "wi-snow";
        break;
      case "sleet":
        selectedIcon = "wi-sleet";
        break;
      case "wind":
        selectedIcon = "wi-strong-wind";
        break;
      case "fog":
        selectedIcon = "wi-fog";
        break;
      case "cloudy":
        selectedIcon = "wi-cloudy";
        break;
      case "partly-cloudy-day":
        selectedIcon = "wi-day-sunny-overcast";
        break;
      case "partly-cloudy-night":
        selectedIcon = "wi-night-alt-partly-cloudy";
        break;
      default:
        selectedIcon = "wi-cloudy";
    }
    return selectedIcon;
  };
  //function for fetching style names
  this.getStyles = function() {
    return ["weather.css", "weather-icons.min.css"];
  };
}
