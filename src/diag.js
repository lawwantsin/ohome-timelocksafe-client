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
