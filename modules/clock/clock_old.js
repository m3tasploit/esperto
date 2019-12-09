//clock function

const clock = (format, seconds) => {
  const elt = document.getElementsByClassName("region bottom left");
//function for adding zero before numbers
  const addZero = () => {
    if (h < 10) {
      h = `0${h}`;
    }
    if (m < 10) {
      m = `0${m}`;
    }
    if (s < 10 && typeof s !== "undefined") {
      s = `0${s}`;
    }
  };
  const today = new Date();
  let ht;
  let h = today.getHours();
  let m = today.getMinutes();
  let s;
  if (seconds) {
    s = today.getSeconds();
  }

  const secondsCheck = function() {
    if (typeof s === "undefined") {
      return " ";
    } else {
      return ` : ${s} `;
    }
  };

  addZero();

  let timeString = `${h} : ${m}${secondsCheck()}`;

  if (format === "12H") {
    ht = h;
    if (h > 12) {
      h -= 12;
    }
    if (h == 0) {
      h = 12;
    }
    if (ht >= 12) {
      timeString = `${h} : ${m}${secondsCheck()}PM`;
    } else {
      timeString = `${h} : ${m}${secondsCheck()}AM`;
    }
  }
  for (let i in elt) {
    elt[i].innerHTML = timeString;
  }
};
