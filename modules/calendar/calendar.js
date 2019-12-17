function Calendar(conf) {
  this.config = conf;
  this.elt = document.getElementsByClassName(this.config.target)[0];
  this.wrapped = false;
  this.modulename = "calendar";
  this.currentdate = null;
  this.date = null;
  this.Weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  this.prevhilite = null;
  this.wrapdiv = document.createElement("div");
  this.wrapdiv.setAttribute("id", this.modulename);

  this.createCalendar = function() {
    this.currentdate = new Date();
    this.date = new Date();
    this.wrapdiv.innerHTML = ` <div class="calendar-header"></div>
    <div class="calendar-week"></div>
    <div class="calendar-body"></div>`;
    this.elt.appendChild(this.wrapdiv);
    this.wrapped = true;
  };

  this.getMonthName = function(month) {
    let months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    return months[month];
  };

  this.setWeekDayHeader = function() {
    document.querySelector(`#${this.modulename} .calendar-week`).innerHTML = `
        <span>${this.Weekday[0]}</span>
        <span>${this.Weekday[1]}</span>
        <span>${this.Weekday[2]}</span>
        <span>${this.Weekday[3]}</span>
        <span>${this.Weekday[4]}</span>
        <span>${this.Weekday[5]}</span>
        <span>${this.Weekday[6]}</span>
    `;
  };

  this.setCalendarHeader = function() {
    let month = this.currentdate.getMonth();
    document.querySelector(`#${this.modulename} .calendar-header`).innerHTML = `
    ${this.getMonthName(month)} ${this.currentdate.getFullYear()}
    `;
  };

  this.setCalendarBody = function() {
    this.date.setDate(1);
    let tb = `<table><tr>
    <td>Sun</td>
    <td>Mon</td>
    <td>Tue</td>
    <td>Wed</td>
    <td>Thu</td>
    <td>Fri</td>
    <td>Sat</td>
    </tr>`;

    //blank space beginning
    for (let i = 0; i < this.date.getDay(); i++) {
      tb += "<td> </td>";
    }

    let current = this.date.getMonth();
    let d = 1;
    while (current == this.date.getMonth()) {
      if (this.date.getDay() == 0) {
        tb += "<tr>";
      }
      tb += `<td>${d}</td>`;
      if (this.date.getDay() == 6) {
        tb += "</tr>";
      }
      this.date.setDate(++d);
    }
    tb += "</tr></table>";
    console.log(tb);
    document.querySelector(`#${this.modulename} .calendar-body`).innerHTML = tb;
    //blank space end
    // for(let i = 0){

    // }
  };

  this.hiliteDay = function(clr) {
    let cdate = this.currentdate.getDate();
    let elts = document.querySelectorAll(`#${this.modulename} td`);
    let i;
    for (i = 0; elts[i].innerText != cdate; i++);

    elts[i].style.backgroundColor = "#555";
    if (clr) {
      this.prevhilite.style.backgroundColor = "#000";
    }
    this.prevhilite = elts[i];
  };

  this.clearCalendar = function() {
    let e = document.querySelector(`#${this.modulename}`);
    while (e.lastChild) {
      e.removeChild(e.lastChild);
    }
  };

  this.update = function() {
    let newdate = new Date();
    if (newdate.getDate() != this.currentdate.getDate()) {
      this.currentdate = newdate;
      this.hiliteDay(true);
    }
    if (newdate.getMonth() != this.currentdate.getMonth()) {
      this.clearCalendar();
      this.render();
    }
  };

  this.generate = function() {
    this.createCalendar();
    this.setCalendarHeader();
    this.setCalendarBody();
    this.hiliteDay();
  };

  this.render = function() {
    this.generate();
    setInterval(() => this.update(), 1000);
  };

  this.getStyles = function() {
    return ["calendar.css"];
  };
}
