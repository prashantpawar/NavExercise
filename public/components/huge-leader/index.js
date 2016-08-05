(function (hugeApp) {
  function init() {
    console.log("leader");
    hugeApp.registerElement('huge-leader');
  }

  document.addEventListener('DOMContentLoaded', init);
}( window.hugeApp = window.hugeApp || {}, document ));
