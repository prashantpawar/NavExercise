(function (hugeApp, document) {
  function setHamburgerMenu(el) {
    el.setAttribute('hamburger-menu', '');

    var closeEl = document.createElement('span');
    closeEl.innerHTML = '&#x2715;';
    closeEl.setAttribute('class', 'close-nav');
    el.appendChild(closeEl);

    return el;
  };

  function init() {
    hugeApp.hugeNavElements = document.querySelectorAll('[huge-nav]');

    //Sadly hugeNavElements does not have my favorite fn map
    Array.prototype.map.call(hugeApp.hugeNavElements, setHamburgerMenu);
  }


  document.addEventListener('DOMContentLoaded', init);
}( window.hugeApp = window.hugeApp || {}, document ));
