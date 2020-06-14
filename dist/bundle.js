// Lil jQuery tribute.
const $ = e => document.querySelector(e);
const $$ = e => Array.from(document.querySelectorAll(e))

// Convenience for checking for JS achilles heal.
const tu = (T) => {
  return typeof T !== "undefined";
};

const h = input => {
  if (!tu(input)) return '';
  return input
}

const pretty = time => {
  const output = `${h(time.hour)}:${Utils.padZeros(h(time.minute))}:${Utils.padZeros(h(time.second))} ${h(time.meridian)}`
  return output
}

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
// Our way of telling if an event bubbled up from the right target.
const hitTarget = (target, className) => {
  if (!target.classList) console.error("No Class List")
  if (!className) console.error("No Class Name")
  return Array.from(target.classList).includes(className);
}

const HL = "highlighted"
const formWizardClick = () => {
  const WB = "wizard-button",
        P = "page_",
        fwDom = $(".form-wizard"),
        buttons = $$("."+WB)
  if (!fwDom) return;
  fwDom.addEventListener("click", e => {
    const target = e.target;
    if (hitTarget(target, "js-"+WB)) {
      const id = target.getAttribute("data-id");
      // Highlight button
      if (buttons) buttons.map(x => x.classList.remove(HL));
      target.classList.add(HL)
      // Switch Panels
      const fwCL = fwDom.classList
      fwCL.remove(P+0, P+1)
      fwCL.add(P+id);
    }
  })
}

const selectAllClick = () => {
  const ALL = "all",
        NONE = "none",
        selectButton = $(".select");
  if (selectButton) selectButton.addEventListener("click", e => {
    const buttons = $$(".day")
    if (buttons.length === 0) return;
    // Switch to None
    if (hitTarget(selectButton, ALL)) {
      selectButton.classList.remove(ALL)
      selectButton.classList.add(NONE)
      buttons.map(x => x.classList.add(HL));
    }
    // Switch to All
    else {
      selectButton.classList.remove(NONE)
      selectButton.classList.add(ALL)
      buttons.map(x => x.classList.remove(HL));
    }
  })
}

const daysClick = () => {
  const days = $(".days-buttons");
  if (days) days.addEventListener("click", e => {
    if (hitTarget(e.target, 'day')) {
      e.target.classList.toggle(HL)
      const num = e.target.getAttribute("data-id");
      const d = STORE.add.days || {}
      const newDay = { [num]: !d[num] };
      STORE.add.days = { ...d, ...newDay }
    }
  })
}

const timeSetter = () => {
  const ts = $(".time-setter");
  if (ts) ts.addEventListener("click", e => {
    if (hitTarget(e.target, "digital-time")) ts.classList.toggle("digits");
  })
}

const submitPayload = async () => {
  // @TODO: Add FROM_NOW and FREQ parameters
  const e = a => encodeURIComponent(String(a));
  let { min, days, meridian, hour } = STORE.add;
  hour = meridian == PM ? hour + 12 : hour;
  const payload = {
    h: e(hour),
    m: e(min),
    mb: 1,
    mf: 1
  };
  const DOW = ["m", "t", "w", "h", "f", "s", "u"];
  DOW.map((dow, index) => {
    if (days[index]) payload["dow" + dow] = `${index}`;
  });
  const response = await Utils.get("edit.json", payload);
  const data = await response.json();
  if (response.ok) {
    window.location.href = "/alarms";
  } else {
    this.serverMsg = data.message;
  }
};

const saveClick = () => {
  const add = $(".add");
  if (add) add.addEventListener("click", e => {
    if (hitTarget(e.target, "js-save")) {
      e.target.classList.add("loading");
      submitPayload().then(res => {
        e.target.classList.remove("loading");
      })
    }
  })
}

window.addEventListener('DOMContentLoaded', function() {
  formWizardClick()
  timeSetter()
  selectAllClick()
  daysClick()
  saveClick()
});
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
const loadDiagnostics = () => {
  Utils.get("diag.json").then(response => {
    const { data } = response;
    let { uptime, alarms, version } = data;
    Object.keys(data).map(key => {
      const renderTo = $(`.diag .${key}`)
      if (renderTo) renderTo.innerText = data[key]
    });
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

window.addEventListener('DOMContentLoaded', function() {
  if ($('.diag')) loadDiagnostics()
})
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
  renderList();
}

const renderList = () => {
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
  console.log(alarms);
  alarms.map((item, i) => {
    var li = document.createElement('li');
    li.innerHTML = $('#item-template').innerHTML;
    li.classList.add("item");
    li.setAttribute('data-id', item.id);
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
    STORE.alarms = alarms
      .filter(a => {
        return a.id !== id;
      })
      .sort(asc);
      renderList();
  } else {
    serverMsg = json.message;
  }
};

const toggle = async (id) => {
  const response = await Utils.get("toggle.json", {
    toggleaid: id
  });
  const json = await response.json();
  if (response.ok) {
    const otherAlarms = alarms.filter(a => {
      return id !== a.id;
    });
    toggledAlarm.enabled = !toggledAlarm.enabled;
    alarms = [...otherAlarms, toggledAlarm].sort(asc);
  } else {
    serverMsg = json.message;
  }
};

const openNow = async () => {
  const response = await Utils.get("unlock.json");
  console.log(response);
  if (response.message != 'Unlocked Successfully') {
    serverMsg = response.message;
  }
};

const handleListClick = event => {
  const target = event.target;
  const classes = Array.from(target.classList)
  console.log(classes)
  if (classes.includes('js-toggle')) {
    const id = target.closest(".item").getAttribute("data-id")
    toggle(id)
  }
  if (classes.includes('js-remove')) {
    const id = target.closest(".item").getAttribute("data-id")
    removeAlarm(id)
  }
}

window.addEventListener('DOMContentLoaded', function() {
  const list = $('.list')
  if (list) {
    loadList()
    list.addEventListener("click", e => handleListClick(e))
  }
  const openBox = $(".js-open-box button")
  if (openBox)
    openBox.addEventListener('click', () => openNow());
});
const loadLogs = () => {
  const renderTo = $(".logs pre")
  Utils.get("logs.json").then(response => {
    renderTo.innerText = response.data;
  })
}

window.addEventListener('DOMContentLoaded', function() {
    if ($('.logs')) loadLogs()
});
let STORE = {
  box: {},
  client: {},
  input: {},
  setup: {},
  add: {},
}




// const router = e => {
//   const path = e || (history.state && history.state.path)
//   // console.log(path, history.state, e);
//   const b = $('body').classList;  // For clarity sake.
//   b.remove("add", "setup", "list", "logs", "diag")
//   if (path.match(/add/)) b.add("add");
//   else if (path.match(/list/)) { b.add("list"); loadList() }
//   else if (path.match(/logs/)) { b.add("logs"); loadLogs() }
//   else if (path.match(/diag/)) { b.add("diag"); loadDiagnostics() }
//   // The index landing page
//   else {
//     b.add("setup")
//     renderLoop();
//     loadTimezones();
//     loadTime();
//   }
// }

// window.onpopstate = function(e) {
//   router(e);
// }
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

window.addEventListener('DOMContentLoaded', function() {
    // Set the clockface
    if ($('.js-time-zones')) {
      loadTimezones();
    }
    const op = STORE.input.isCurrent ? "isCurrent" : "isNotCurrent",
          setup = $('.setup');
    if (setup) {
      updateLoop()
      loadTime();
      setup.classList.remove("isCurrent", "isNotCurrent");
      setup.classList.add(op);
    }

    // Initial Setup
    const timeCorrect = $('.js-is-current-time-correct');
    if (timeCorrect)
      timeCorrect.addEventListener('click', isCurrentTime);
});
