(function (hugeApp, document) {
  hugeApp.registerElement = function registerElement(elementName) {
    var customEl = document.registerElement(elementName);
  };

  function init() {
      
  }

  document.addEventListener('DOMContentLoaded', init);
}( window.hugeApp = window.hugeApp || {}, document ));
