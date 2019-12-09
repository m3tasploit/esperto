function Weather(conf) {
  this.config = conf;
  this.lat = this.config.lat;
  this.lon = this.config.lon;
  this.appid = this.config.api_key;
  this.elt = document.getElementsByClassName(this.config.target)[0];
  this.wrapper = false;
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
      let url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/${this.appid}/${this.lat},${this.lon}`;
      const response = await fetch(url).catch(error => console.error(error));
      this.fdata = await response.json().catch(error => console.error(error));
      console.log(this.fdata);
    } else {
      console.error("Error invalid weather provider");
    }
  };

  this.renderOutput = function(_this) {
    if (!_this.wrapper) {
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
      _this.elt.appendChild(wrapdiv);
      _this.wrapper = true;
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
    if (_this.config.provider === "openweathermap") {
      const currentWeather = _this.wdata.weather[0];
      let location = _this.fdata.city;
      let forecast = _this.fdata.list;
      const widgetHeader = `<h1>${location.name}</h1><small>${currentWeather.description}</small>`;
      CURRENT_TEMP.innerHTML = `<i class="wi ${_this.applyIcon(
        currentWeather.icon
      )}"></i> ${Math.round(
        _this.wdata.main.temp
      )} <i class="wi wi-degrees"></i>`;
      CURRENT_LOCATION.innerHTML = widgetHeader;
      // render each daily forecast
      forecast.forEach(day => {
        let date = new Date(day.dt * 1000);
        let time = `${date.getHours()}:${date.getMinutes()}`;

        let dayBlock = document.createElement("div");
        dayBlock.className = "forecast__item";
        dayBlock.innerHTML = `<div class="forecast-item__heading">${time}</div>
  <div class="forecast-item__info"><i class="wi ${_this.applyIcon(
    day.weather[0].icon
  )}"></i> <span class="degrees">${Math.round(
          day.main.temp
        )}<i class="wi wi-degrees"></i></span></div>`;
        FORECAST.appendChild(dayBlock);
      });
    } else if (_this.config.provider === "darksky") {
    } else {
      console.error("error");
    }
  };

  this.render = function() {
    this.generate().then(() => this.renderOutput(this));
  };

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
  this.getStyles = function() {
    return ["weather.css", "weather-icons.min.css"];
  };
}
