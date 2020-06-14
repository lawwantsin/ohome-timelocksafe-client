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
