console.log("index.js loaded");

window.hugeApp = {};

window.hugeApp.utils = (function (hugeApp) {
  return {
  }
})(window.hugeApp);

window.hugeApp.store = (function (hugeApp) {
  var callbacks = [];
  var state;
  function createStore(reducer) {
    state = reducer();
    return {
      getState: function () {
        return state;
      },
      dispatchWithVal: function (action) {
        var that = this;
        state = reducer(that.getState(), action);

        callbacks.map(function (cb) {
          cb(state); 
        });
      },
      dispatch: function (action) {
        var that = this;
        if(typeof action.then === 'function') {
          action.then(function (resolvedAction) {
              that.dispatchWithVal(resolvedAction);
          });
        } else {
            that.dispatchWithVal(action);
        }
      },
      subscribe: function (cb) {
        callbacks.push(cb);
      }
    }
  }
  return {
    createStore: createStore
  };
})(window.hugeApp);

window.hugeApp.actions = (function (hugeApp) {
  var NAV_OPEN = 'NAV_OPEN';
  var NAV_CLOSE = 'NAV_CLOSE';
  var VIEWPORT_CHANGE = 'VIEWPORT_CHANGE';
  var NAV_ITEMS_LOADED = 'NAV_ITEMS_LOADED';
  
  function fetch(url) {
    return new Promise(function (fulfill, reject) {
      var oReq = new XMLHttpRequest();
      oReq.addEventListener('load', function (evt) {
          fulfill(this.responseText);
      });
      oReq.open("GET", url);
      oReq.send();
    });
  }

  function openNav() {
    return {
      type: NAV_OPEN
    }
  }

  function closeNav() {
    return {
      type: NAV_CLOSE
    }
  }

  function changeViewport(viewportType) {
    return {
      type: VIEWPORT_CHANGE,
      viewportType: viewportType
    }
  }

  function loadNavItems() {
    return fetch('/api/nav.json').then(function (response) {
      var navItems = JSON.parse(response);
      return {
        type: NAV_ITEMS_LOADED,
        navItems: navItems.items
      }
    });
  }

  return {
    /**
    * Action types
    **/
    VIEWPORT_CHANGE: VIEWPORT_CHANGE,
    NAV_OPEN: NAV_OPEN,
    NAV_CLOSE: NAV_CLOSE,
    NAV_ITEMS_LOADED: NAV_ITEMS_LOADED,

    /**
    * Other constants
    **/
    ViewportTypes: {
      NARROW: 'NARROW',
      WIDE: 'WIDE'
    },

    /**
    * Action Creators
    **/
    openNav: openNav,
    closeNav: closeNav,
    changeViewport: changeViewport,
    loadNavItems: loadNavItems
  }
}(window.hugeApp));

window.hugeApp.reducers = (function (hugeApp) {
  var actions = hugeApp.actions;
  var ViewportTypes = actions.ViewportTypes;

  var initialState = {
    navOpen: false,
    viewportType: ViewportTypes.WIDE,
    navItems: []
  };

  return {
    hugeAppReducer: function (state, action) {
      if(typeof state === 'undefined') {
        state = initialState;
      }

      if(!action || !action.type) {
        return state;
      }

      switch(action.type) {
        case actions.NAV_OPEN:
          return Object.assign({}, state, {
            navOpen: true
          });
        case actions.NAV_CLOSE:
          return Object.assign({}, state, {
            navOpen: false
          });
        case actions.VIEWPORT_CHANGE:
          return Object.assign({}, state, {
            viewportType: action.viewportType
          });
        case actions.NAV_ITEMS_LOADED:
          return Object.assign({}, state, {
            navItems: action.navItems 
          });
        default:
          return state;
      }
    }
  };
})(window.hugeApp);

window.hugeApp = (function (hugeApp, document) {
  var actions = hugeApp.actions;
  var reducers = hugeApp.reducers;
  var createStore = hugeApp.store.createStore;
  var utils = hugeApp.utils;

  function renderSecondaryNavItem(state, rootEl) {
    var liElement = document.createElement('li');

    var anchorElement = document.createElement('a');
    anchorElement.setAttribute('href', state.url);
    anchorElement.innerHTML = state.label;
    liElement.appendChild(anchorElement);

    rootEl.appendChild(liElement);
  }

  function renderSecondaryNav(state, rootEl) {
    var ulSecondaryNav = document.createElement('ul');
    ulSecondaryNav.setAttribute('huge-secondary-nav', '');

    state.map(function (item) {
      renderSecondaryNavItem(item, ulSecondaryNav);
    });
    
    rootEl.appendChild(ulSecondaryNav);
  }

  function renderPrimaryNavItem(state, rootEl) {
    var liElement = document.createElement('li');
    liElement.setAttribute('huge-nav-item', '');

    var anchorElement = document.createElement('a');
    anchorElement.setAttribute('href', state.url);
    anchorElement.innerHTML = state.label;
    liElement.appendChild(anchorElement);

    renderSecondaryNav(state.items, liElement);

    rootEl.appendChild(liElement);
  }

  function renderPrimaryNav(state, rootEl) {
    var primaryNavHook = rootEl.getElementsByTagName('huge-primary-nav');
    var hamburgerOrCloseEl = rootEl.querySelector('.hamburger-close-nav');
    var reRender = false;

    //Handle re-render
    if(primaryNavHook.length === 0) {
      primaryNavHook = document.createElement('huge-primary-nav');
      rootEl.appendChild(primaryNavHook);
    } else {
      primaryNavHook = primaryNavHook[0];
    }

    if(!hamburgerOrCloseEl) {
      hamburgerOrCloseEl = document.createElement('span');
      hamburgerOrCloseEl.setAttribute('class', 'hamburger-close-nav');
      hamburgerOrCloseEl.onclick = function () {
        if(store.getState().navOpen === true) {
          store.dispatch(actions.closeNav());
        } else {
          store.dispatch(actions.openNav());
        }
      };
      rootEl.appendChild(hamburgerOrCloseEl);
    }


    var ulPrimaryNav = document.querySelector('ul[huge-primary-nav]');
    //TODO: Refactor this approach, this isn't optimal
    if(!ulPrimaryNav) { //Static elements, no need to re-render
      var hugeLabel = document.createElement('h1');
      hugeLabel.innerHTML = 'HUGE';
      primaryNavHook.appendChild(hugeLabel);

      ulPrimaryNav = document.createElement('ul');
      ulPrimaryNav.setAttribute('huge-primary-nav', '');
      primaryNavHook.appendChild(ulPrimaryNav);

      var footerEl = document.createElement('footer');
      footerEl.innerHTML = '&copy; 2016 Huge. All Rights Reserved.';
      primaryNavHook.appendChild(footerEl);
    }

    state.navItems.map(function (item) {
      renderPrimaryNavItem(item, ulPrimaryNav);
    });
  }

  function renderNavEnhancements(state, rootEl) {
    if(state.viewportType === actions.ViewportTypes.NARROW) {
      rootEl.setAttribute('hamburger-menu', '');
    } else {
      rootEl.removeAttribute('hamburger-menu');
    }

    if(state.navOpen === true) {
      rootEl.setAttribute('nav-open', '');
    } else {
      rootEl.removeAttribute('nav-open');
    }
  }

  function renderNav(state, rootEl) {
    var navNode = rootEl.querySelector('[huge-nav]');

    renderPrimaryNav(state, navNode);
    renderNavEnhancements(state, navNode);
  }

  function render(state, rootEl) {
    if(typeof rootEl === 'undefined') {
      rootEl = document.getElementById('root');
    }
    console.log('rendering');

    renderNav(state, rootEl);
  }

  function initApp() {
    console.log("app being initialized", hugeApp);
    /**
     * SETUP
     **/
    store = createStore(reducers.hugeAppReducer);
    store.subscribe(render);
    store.dispatch(actions.loadNavItems());
    /**
     * END SETUP
     **/
  }

  function registerElement(elementName) {
    var customEl = document.registerElement(elementName);
    return customEl;
  }

  return Object.assign({}, hugeApp, {
    initApp: initApp,
    registerElement: registerElement
  });
}(window.hugeApp, document));

document.addEventListener('DOMContentLoaded', hugeApp.initApp);
