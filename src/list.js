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
