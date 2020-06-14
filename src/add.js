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
