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
