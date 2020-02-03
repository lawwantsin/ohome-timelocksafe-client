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
