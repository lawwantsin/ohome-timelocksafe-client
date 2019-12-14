// const LOCAL_JSON_SERVER = "http://localhost:3000/";
// const JSON_SERVER = "https://api.ohome.io/";
const BOX_SERVER = "http://172.16.0.1/";
const SERVER = BOX_SERVER;

export const AM = 0;
export const PM = 1;
export const NONE = 0;
export const DOW = 1;
export const FREQ = 2;
export const FROM_NOW = 3;
export const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];


const $ = e => document.querySelector(e);
const $$ = e => Array.from(document.querySelectorAll(e))


// const SERVER = LOCAL_JSON_SERVER;

// const tu = (a: any) => {
//   return typeof a !== "undefined";
// };

// const Utils = {
//   setTime: (num, base) => {
//     const i = parseInt;
//     let hour, min;
//     switch (num.length) {
//       case 0:
//         hour = 0;
//         min = 0;
//         break;
//       case 1:
//         hour = 0;
//         min = i(num[0]);
//         break;
//       case 2:
//         hour = 0;
//         min = i(num[0] + num[1]);
//         break;
//       case 3:
//         hour = i(num[0]);
//         min = i(num[1] + num[2]);
//         if (min > 59) min = 59;
//         break;
//       case 4:
//         hour = i(num[0] + num[1]);
//         if (hour > 12 && base === 12) hour = 12;
//         if (hour > 23 && base === 24) hour = 23;
//         hour = hour;
//         min = i(num[2] + num[3]);
//         if (min > 59) min = 59;
//     }
//     return { hour, min };
//   },
//   parseAlarms: (alarms) => {
//     const i = parseInt;
//     if (!alarms || alarms.length === 0) return [];
//     const r = /(\d) (True|False) \(([0-6\,\s?]{0,19})\) (\d{1,2}):(\d{1,2})-(\d{1,3})m\+(\d{1,3})m/;
//     return alarms.map(a => {
//       const res = a.match(r);
//       let [_, id, enabled, dow, hour, min, before, after] = res;
//       let days = {};
//       _ = ""; // To use it bc typescript.
//       const dowArray = dow.split(`, ${_}`).map(x => x.replace(",", ""));
//       if (dowArray.length > 0) {
//         dowArray.map((d) => {
//           days[d] = true;
//         });
//       }
//       let al = {
//         id: i(id),
//         enabled: enabled === "True",
//         days,
//         hour: i(hour),
//         min: i(min),
//         before: i(before),
//         after: i(after),
//         freq: 0,
//         mode: DOW
//       }
//       return al;
//     });
//   },
//   get: (resource, payload) => {
//     try {
//       let url;
//       const esc = encodeURIComponent;
//       const id = payload.id;
//       delete payload.id;
//       const l = Object.keys(payload).length;
//       const query = Object.keys(payload)
//         .map(k => esc(k) + "=" + esc(payload[k]))
//         .join("&");
//       url = SERVER + resource + (id ? `/${id}` : "") + (l ? "?" + query : "");
//       const response = fetch(url, {
//         method: "GET"
//       }).then(response => {
//         return response;
//       });
//     } catch (err) {
//       console.log("ERR", err);
//       return err;
//     }
//   }
// }
//
// Unused for now
// static post = async (url, payload: any) => {
//   try {
//     const { id } = payload;
//     delete payload.id;
//     const response = await fetch(SERVER + url + (tu(id) ? `/${id}` : ""), {
//       method: id ? "PUT" : "POST",
//       body: JSON.stringify(payload),
//       headers: {
//         "Content-Type": "application/json"
//       }
//     });
//     return await response.json();
//   } catch (err) {
//     return err;
//   }
// };
//
// static delete = async (url, payload: any) => {
//   try {
//     const response = await fetch(SERVER + url + `/${payload.id}`, {
//       method: "DELETE"
//     });
//     return await response.json();
//   } catch (err) {
//     return err;
//   }
// };



const router = e => {
  const path = (history.state && history.state.path) || e
  console.log(path, history.state, e);
  $('body').classList.remove("add", "setup", "list", "logs", "diag")
  if (path.match(/add/)) $('body').classList.add("add")
  if (path.match(/setup/)) $('body').classList.add("setup")
  if (path.match(/list/)) $('body').classList.add("list")
  if (path.match(/logs/)) $('body').classList.add("logs")
  if (path.match(/diag/)) $('body').classList.add("diag")
}

(function() {

const padZeros = (num) => {
  return num < 10 ? "0" + num : "" + num;
};

const clockSize = 280,
byFives = false;

const minHand = $('.minuteHand');
const hourHand = $('.hourHand')

const setHands = (deg, hour, min) => {
  let minDeg;
  minDeg = Math.round(min * 6.0);
  if (byFives) {
    minDeg = Math.ceil(minDeg / 5.0) * 5.0; // By 5s.
  } else {
    minDeg = Math.ceil(minDeg);
  }
  // Render
  minHand.style.transform = `rotate(${minDeg}deg)`;
  hourHand.style.transform = `rotate(${deg}deg)`;
}

const setDisplay = (hourString, minString) => {
  $('.digital-time .hour').innerText = hourString
  $('.digital-time .min').innerText = minString
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
  const hourString = isNaN(hour) || hour === 0 ? "" : padZeros(hour);
  let minString = isNaN(min) ? "" : padZeros(min);
  // console.log("deg", deg, "hour", hour, "min", min);
  setHands(deg, hour, min);
  setDisplay(hourString, minString);
}

// Events
$("#js-clock").addEventListener('mousemove', handleClockMousemove)
$$(".nav-header a").map(a => a.addEventListener("click", e => {
  e.preventDefault();
  const path = e.target.href;
  history.pushState({path}, "", path);
  router(path);
}))
}());
window.onpopstate = function(e) {
  console.log(e);
  router(e);
}
