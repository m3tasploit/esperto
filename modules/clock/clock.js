function Clock(conf) {
  this.timeString = "";
  this.ht = "";
  this.h = "";
  this.m = "";
  this.s = "";
  this.config = conf;
  this.elt = document.getElementsByClassName(this.config.target)[0];
  this.wrapped = false;
  this.modulename = "clock";

  this.generate = function() {
    let today = new Date();

    this.h = today.getHours();
    this.m = today.getMinutes();
    if (this.config.seconds) {
      this.s = today.getSeconds();
    }
    this.addZero();
    //24H or 12H clock
    if (this.config.format === "12H") {
      this.ht = this.h;
      if (this.h > 12) {
        this.h -= 12;
      }
      if (this.h == 0) {
        this.h = 12;
      }
      if (this.ht >= 12) {
        this.timeString = `${this.h} : ${this.m}${this.secondsCheck()}PM`;
      } else {
        this.timeString = `${this.h} : ${this.m}${this.secondsCheck()}AM`;
      }
    } else {
      this.timeString = `${this.h} : ${this.m}${this.secondsCheck()}`;
    }
  };

  this.secondsCheck = function() {
    if (!this.config.seconds) {
      return " ";
    } else {
      return ` : ${this.s} `;
    }
  };
  //adding zero before text
  this.addZero = function() {
    if (this.h < 10) {
      this.h = `0${this.h}`;
    }
    if (this.m < 10) {
      this.m = `0${this.m}`;
    }
    if (this.s < 10 && this.s !== "") {
      this.s = `0${this.s}`;
    }
  };
  this.getStyles = function() {
    return ["clock.css"];
  };
  this.renderOutput = function() {
    this.generate();
    if (this.wrapped) {
      document.getElementById(this.modulename).innerHTML = this.timeString;
    } else {
      let tempelt = document.getElementById(this.config.modulename);
      if (tempelt) {
        tempelt.parentNode.removeChild(tempelt);
      }
      let wrapdiv = document.createElement("div");
      wrapdiv.setAttribute("id", this.modulename);
      wrapdiv.className = this.config.classlist;
      wrapdiv.innerText = this.timeString;
      this.elt.appendChild(wrapdiv);
      this.wrapped = true;
    }
  };

  this.render = function() {
    setInterval(() => this.renderOutput(), 1000);
  };
}
