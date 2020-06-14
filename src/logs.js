const loadLogs = () => {
  const renderTo = $(".logs pre")
  Utils.get("logs.json").then(response => {
    renderTo.innerText = response.data;
  })
}

window.addEventListener('DOMContentLoaded', function() {
    if ($('.logs')) loadLogs()
});
