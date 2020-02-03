// Lil jQuery tribute.
const $ = e => document.querySelector(e);
const $$ = e => Array.from(document.querySelectorAll(e))

// Convenience for checking for JS achilles heal.
const tu = (T) => {
  return typeof T !== "undefined";
};

// Utilities that all files use.
const Utils = {
  padZeros: (num) => {
    return num < 10 ? "0" + num : "" + num;
  },
  get: (resource, payload) => {
    try {
      let url, id, l, query;
      const esc = encodeURIComponent;
      if (payload) {
        id = payload.id;
        delete payload.id;
        l = Object.keys(payload).length;
        query = Object.keys(payload)
          .map(k => esc(k) + "=" + esc(payload[k]))
          .join("&");
        url = SERVER + resource + (id ? `/${id}` : "") + (l ? "?" + query : "");
      }
      else {
        url = SERVER + resource
      }
      return fetch(url, { method: "GET" }).then(r => r.json())
    } catch (err) {
      return err;
    }
  },
  parseAlarms: (alarms) => {
    const i = parseInt;
    if (!alarms || alarms.length === 0) return [];
    const r = /(\d) (True|False) \(([0-6\,\s?]{0,19})\) (\d{1,2}):(\d{1,2})-(\d{1,3})m\+(\d{1,3})m/;
    return alarms.map(a => {
      const res = a.match(r);
      let [_, id, enabled, dow, hour, min, before, after] = res;
      let days = {};
      _ = ""; // To use it bc typescript.
      const dowArray = dow.split(`, ${_}`).map(x => x.replace(",", ""));
      if (dowArray.length > 0) {
        dowArray.map(d => {
          days[d] = true;
        });
      }
      let al = {
        id: i(id),
        enabled: enabled === "True",
        days,
        hour: i(hour),
        min: i(min),
        before: i(before),
        after: i(after),
        freq: 0,
        mode: DOW
      }
      return al;
    });
  }
}

// const LOCAL_JSON_SERVER = "http://localhost:3000/";
// const JSON_SERVER = "https://api.ohome.io/";
const BOX_SERVER = "http://172.16.0.1/";
const SERVER = BOX_SERVER;

const AM = 0;
const PM = 1;
const NONE = 0;
const DOW = 1;
const FREQ = 2;
const FROM_NOW = 3;
const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
];
const FORMAT = "LL LTS";
const STATE = {
  alarms: []
};

const asc = (x, y) => (x.id > y.id ? 1 : -1);

const loadList = async () => {
  const response = await Utils.get("alarms.json");
  const alarms =  Utils.parseAlarms(response.data).sort(asc);
  update(alarms);
};

const update = (alarms) => {
  STATE.alarms = alarms;
  render();
}

const render = () => {
  const alarms = STATE.alarms;
  const r = $('.renderList');
  r.innerHTML = "";
  const rc = r.classList;
  rc.remove('some', 'none');

  // No Alarms
  if (alarms.length === 0) {
    rc.add('none');
    return
  }
  // Yes alarms
  rc.add('some');
  alarms.map((item, i) => {
    var li = document.createElement('li');
    li.innerHTML = $('#item-template').innerHTML;
    li.classList.add("item");
    const a = r.appendChild(li);
    const z = Utils.padZeros;
    item.meridian = "AM"
    if (item.hour > 11) {
      item.meridian = "PM";
      item.hour = item.hour - 12;
    }
    WEEKDAYS.map((dayString, index) => {
      const active = item.days[index] ? "active" : "";
      const classes = `day ${active}`;
      a.querySelector(`._${index}`).className = classes
    })
    a.querySelector(".hour").innerText = item.hour;
    a.querySelector(".minutes").innerText = z(item.min);
    a.querySelector(".meridian").innerText = item.meridian;
    const ts = a.querySelector(".toggle-switch").classList;
    ts.remove("_off", "_on")
    ts.add(item.enabled ? "_on" : "_off");
  });
}

const removeAlarm = async (id) => {
  const response = await Utils.get("delete.json", { delaid: id });
  const json = await response.json();
  if (response.ok) {
    alarms = alarms
      .filter(a => {
        return a.id !== id;
      })
      .sort(asc);
  } else {
    serverMsg = json.message;
  }
};

const toggle = async (toggledAlarm) => {
  const response = await Utils.get("toggle.json", {
    toggleaid: toggledAlarm.id
  });
  const json = await response.json();
  if (response.ok) {
    const otherAlarms = alarms.filter(a => {
      return toggledAlarm.id !== a.id;
    });
    toggledAlarm.enabled = !toggledAlarm.enabled;
    alarms = [...otherAlarms, toggledAlarm].sort(asc);
  } else {
    serverMsg = json.message;
  }
};

const openNow = async () => {
  const response = await Utils.get("unlock.json");
  const data = await response.json();
  if (response.ok) {
    //
  } else {
    serverMsg = data.message;
  }
};
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

const loadTimezones = () => {
  const select = $(".selectInput")
  Utils.get("timezones.json").then(response => {
    let label, value;
    response.data.map(option => {
      if (typeof option == 'string')
        label = value = option;
      else {
        label = option.label;
        value = option.value;
      }
      select.options.add(new Option(label, value))
    });
  });
}

const loadDiagnostics = () => {
  Utils.get("diag.json").then(response => {
    const { data } = response;
    let { uptime, alarms, version } = data;
    Object.keys(data).map(key => {
      const renderTo = $(`.diag .${key}`)
      if (renderTo) renderTo.innerText = data[key]
    });
    console.log("ALARMS", alarms);
    if (alarms.length > 0) {
      $(".alarms-list").innerHTML = '<li>Test</li>'
    }
    else {
      $(".diag .alarms").innerHTML = "No Alarms Setup"
    }
    if (version) {
      let output = version.map(v => `<li class="col2"><p>${v[0]}</p><p>${v[1]}</p></li>`)
      $('.diag .version').innerHTML = output.join('');
    }
    if (uptime) {
      uptime = uptime.split(".")[0].split(":");
      uptime.map((up, i) => $(`.diag .up${i}`).innerText = up)
    }
  })
}

const loadLogs = () => {
  const renderTo = $(".logs pre")
  Utils.get("logs.json").then(response => {
    renderTo.innerText = response.data;
  })
}

const router = e => {
  const path = e || (history.state && history.state.path)
  // console.log(path, history.state, e);
  const b = $('body').classList;
  b.remove("add", "setup", "list", "logs", "diag")
  // The routes
  if (path.match(/setup/)) b.add("setup")
  else if (path.match(/add/)) b.add("add")
  else if (path.match(/list/)) { b.add("list"); loadList() }
  else if (path.match(/logs/)) { b.add("logs"); loadLogs() }
  else if (path.match(/diag/)) { b.add("diag"); loadDiagnostics() }
  // The default
  else b.add("setup")
}

(function() {
  const clockSize = 280, byFives = false;
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

  window.onload = function() {
      $("#js-clock").addEventListener('mousemove', handleClockMousemove);
      $(".js-add-new").addEventListener('click', () => router('/add'));
      $$(".nav-header a").map(a => a.addEventListener("click", e => {
        e.preventDefault();
        const path = e.target.href;
        history.pushState({path}, "", path);
        router(path);
      }))
      router(location.pathname);
  };

  window.onpopstate = function(e) {
    router(e);
  }
}());
