const clockSize = 280, byFives = false;
const PM = "PM", AM = "AM";

const renderHands = (deg, hour, min) => {
  let minDeg;
  minDeg = Math.round(min * 6.0);
  if (byFives) minDeg = Math.ceil(minDeg / 5.0) * 5.0; // By 5s.
  else minDeg = Math.ceil(minDeg);
  // Render
  $('.minuteHand').style.transform = `rotate(${minDeg}deg)`;
  $('.hourHand').style.transform = `rotate(${deg}deg)`;
}

const renderDisplay = (hourString, minString) => {
  const hour = $('.digital-time .hour')
  if (hour) hour.innerText = hourString;
  const min = $('.digital-time .min')
  if (min) min.innerText = minString;
}

const loadTime = () => {
  Utils.get("time.json").then(response => {
    STORE.box.local = response.data.local;
    storeStats('box');
    reloadClientTime();
    // console.log("STORE", STORE)
  })
}

const reloadClientTime = () => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  STORE.client.dateObject = d;
  STORE.client.local = d.toISOString();
  STORE.client.date = STORE.client.local.split("T")[0]
  STORE.client.time = STORE.client.local.split("T")[1]
  storeStats('client')
}

const handleClockMousemove = (ev) => {
  if (ev.buttons === 0) return; // Hold down left click
  let deg, hour, min;
  const x = ev.offsetX;
  const y = ev.offsetY;
  const center = clockSize / 2.0;
  const deltaX = center - x;
  const deltaY = center - y;
  var rad = Math.atan2(deltaY, deltaX);
  deg = rad * (180.0 / Math.PI) - 90;
  if (deg < 0) deg = deg + 360;

  hour = deg / 30.0;
  min = ((deg / 30.0) * 60.0) % 60.0;
  min = Math.round(min);
  hour = Math.floor(hour); // Hour switches on the 0, not the 30 minute mark.
  if (byFives) min = (Math.ceil(min / 5.0) * 5.0); // round by 5s

  if (min < 0) min = 0;
  if (hour <= 0) hour = 12;
  const hourString = isNaN(hour) || hour === 0 ? "" : hour;
  let minString = isNaN(min) ? "" : Utils.padZeros(min);
  // console.log("deg", deg, "hour", hour, "min", min);
  renderHands(deg, hour, min);
  renderDisplay(hourString, minString);
  storeTime(hour, min)
}

const storeTime = (hour, min) => {
  const section = $(".js-clock").getAttribute("data-id");
  if (section) {
    if (['add', 'setup'].includes(section)) {
      STORE[section].hour = hour
      STORE[section].min = min
    }
  }
}

const isCurrentTime = e => {
  STORE.input.isCurrent = parseInt(e.target.dataset.value);
}

const setTime = (num, base) => {
  const i = parseInt;
  let hour, min;
  hour = 0;
  switch (num.length) {
    case 0:
      min = 0;
      break;
    case 1:
      min = i(num[0]);
      break;
    case 2:
      min = i(num[0] + num[1]);
      break;
    case 3:
      hour = i(num[0]);
      min = i(num[1] + num[2]);
      if (min > 59) min = 59;
      break;
    case 4:
      hour = i(num[0] + num[1]);
      if (hour > 12 && base === 12) hour = 12;
      if (hour > 23 && base === 24) hour = 23;
      hour = hour;
      min = i(num[2] + num[3]);
      if (min > 59) min = 59;
  }
  return { hour, min };
}

const storeStats = key => {
  const i = parseInt;
  const loc = STORE[key].local;
  // To correct for the way Python and JS format the date string.  @@ Make them match in storage.
  const splitBy = loc.search("T") != -1 ? "T" : " ";
  let ld = STORE[key].local.split(splitBy);
  if (ld[2]) ld.pop(); // Remove the timezone wording.
  if (ld[1].search("Z") != -1) ld[1] = ld[1].slice(0, -1);
  STORE[key].date = ld[0]
  STORE[key].time = ld[1]
  let t = STORE[key].time.split(":");
  STORE[key].hour = i(t[0]);
  STORE[key].minute = i(t[1]);
  STORE[key].second = i(t[2]);
  STORE[key].hour24 = STORE[key].hour
  if (STORE[key].hour24 > 11) {
    STORE[key].hour = (STORE[key].hour > 12) ? (STORE[key].hour - 12) : STORE[key].hour;
    STORE[key].meridian = PM
  }
  else {
    if (STORE[key].hour24 === 0) STORE[key].hour = 12;
    STORE[key].meridian = AM
  }
  STORE.box.dateObject = Date.parse(STORE.box.date + " " + STORE.box.time);

  // console.log("STORE", STORE)
}


const FRAME_LENGTH = 1000;
let animationId, lastFrame = 0;

const updateLoop = () => {
  const currentFrame = Date.now();
  if (lastFrame + FRAME_LENGTH > currentFrame) {
    reloadClientTime()
    renderTime()
  }
  animationId = requestAnimationFrame(() => updateLoop());
  lastFrame = currentFrame;
}

const renderMeridian = (section = 'box') => {
  if (!['box', 'client', 'add', 'setup'].includes(section)) {
    console.error(`Invalid section in STORE: ${section}`)
    return;
  }
  const am = $(".js-am"),
        pm = $(".js-pm"),
        mer = STORE[section].meridian,
        highlighted = "_highlighted";
  if (!am || !pm) return;
  if (mer === AM) {
    am.classList.add(highlighted);
    pm.classList.remove(highlighted);
  }
  if (mer === PM) {
    pm.classList.add(highlighted);
    am.classList.remove(highlighted);
  }
}

const renderTime = () => {
  const boxTime = $('.boxTime'),
        clientTime = $('.clientTime');
  if (boxTime) boxTime.innerText = pretty(STORE.box);
  if (clientTime) clientTime.innerText = pretty(STORE.client);
  $('.digital-time .hour').innerText = Utils.padZeros(h(STORE.box.hour));
  $('.digital-time .min').innerText = Utils.padZeros(h(STORE.box.minute));
  renderMeridian()
}

const startClock = () => {
  const clock = $$(".js-clock");
  if (clock.length > 0)
    clock.map(h => h.addEventListener('mousemove', handleClockMousemove));
}

const radioButtonClick = () => {
  const radioButtons = $(".radio-buttons");
  if (radioButtons) {
    radioButtons.addEventListener("click", e => {
      if (hitTarget(e.target, "button")) {
        const id = e.target.getAttribute("data-id")
        STORE.add.meridian = id;
        renderMeridian("add");
      }
    })
  }
}

window.addEventListener('DOMContentLoaded', function() {
  startClock()
  radioButtonClick()
})
