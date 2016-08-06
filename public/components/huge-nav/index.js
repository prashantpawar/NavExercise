(function (hugeApp, document) {
  function enableHamburgerMenu(el) {
    el.setAttribute('hamburger-menu', 'show');

    var closeEl = document.createElement('span');
    closeEl.innerHTML = '&#x2715;';
    closeEl.setAttribute('class', 'close-nav');
    closeEl.onclick = function () {
      hideHambergerMenu(el);
    };
    el.appendChild(closeEl);

    return el;
  };

  function showHamburgerMenu(el) {
    el.setAttribute('hamburger-menu', 'show');
  }

  function hideHambergerMenu(el) {
    el.setAttribute('hamburger-menu', 'hide');
  }

  function disableHamburgerMenu(el) {
      
  }

  function init() {
    hugeApp.hugeNavElements = document.querySelectorAll('[huge-nav]');

    //Sadly hugeNavElements does not have my favorite fn map
    Array.prototype.map.call(hugeApp.hugeNavElements, enableHamburgerMenu);
  }


  document.addEventListener('DOMContentLoaded', init);
}( window.hugeApp = window.hugeApp || {}, document ));
