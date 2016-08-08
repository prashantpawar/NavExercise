window.hugeApp = {};

window.hugeApp.utils = (function (hugeApp, document) {
  return {
    createElement: function (tagName, attributes, innerHTML, parentElement) {
      var el = document.createElement(tagName);
      for(var key in attributes) {
        if (!attributes.hasOwnProperty(key)) continue;

        el.setAttribute(key, attributes[key]);
      }
      if(innerHTML) {
        el.innerHTML = innerHTML;
      }
      if(parentElement) {
        parentElement.appendChild(el);
      }
      return el;
    },
    removeAllChildElements: function (parentEl) {
      while(parentEl.firstChild) {
          parentEl.removeChild(parentEl.firstChild);
      }

      return parentEl;
    }
  }
})(window.hugeApp, document);

window.hugeApp.store = (function (hugeApp) {
  var callbacks = [];
  var state;
  function createStore(reducer) {
    state = reducer();
    return {
      getState: function () {
        return state;
      },
      dispatchWithVal: function (action) { //Thunks would be helpful here
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

window.hugeApp.actions = function (hugeApp, XMLHttpRequest) {
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
};

window.hugeApp.reducers = function (hugeApp, XMLHttpRequest) {
  var actions = hugeApp.actions(hugeApp, XMLHttpRequest);;
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
};

window.hugeApp.main = function (hugeApp, document, XMLHttpRequest) {
  var actions = hugeApp.actions(hugeApp, XMLHttpRequest);
  var reducers = hugeApp.reducers(hugeApp, XMLHttpRequest);
  var createStore = hugeApp.store.createStore;
  var utils = hugeApp.utils;

  function renderSecondaryNavItem(state, rootEl) {
    var liElement = document.createElement('li');

    var anchorElement = utils.createElement('a', {'href': state.url}, state.label, liElement);

    rootEl.appendChild(liElement);
  }

  function renderSecondaryNav(state, rootEl) {
    var ulSecondaryNav = utils.createElement('ul', {'huge-secondary-nav': ''}, null, rootEl);

    state.map(function (item) {
      renderSecondaryNavItem(item, ulSecondaryNav);
    });
  }

  function renderPrimaryNavItem(state, rootEl) {
    var liElement = utils.createElement('li', {'huge-nav-item': ''}, null, rootEl);

    var anchorElement = utils.createElement('a', {'href': state.url}, state.label, liElement);

    renderSecondaryNav(state.items, liElement);

    if(state.items.length > 0) {
      utils.createElement('span', {'class': 'chevron'}, null, anchorElement);
    }
  }

  function renderPrimaryNav(state, rootEl) {
    var primaryNavHook = rootEl.getElementsByTagName('huge-primary-nav');
    var hamburgerOrCloseEl = rootEl.querySelector('.hamburger-close-nav');
    var reRender = false;

    //Handle re-render
    if(primaryNavHook.length === 0) {
      primaryNavHook = utils.createElement('huge-primary-nav', null, null, rootEl);
    } else {
      primaryNavHook = primaryNavHook[0];
    }

    if(!hamburgerOrCloseEl) {
      hamburgerOrCloseEl = utils.createElement('span', {'class': 'hamburger-close-nav'}, null, rootEl);
      hamburgerOrCloseEl.onclick = function () {
        if(store.getState().navOpen === true) {
          store.dispatch(actions.closeNav());
        } else {
          store.dispatch(actions.openNav());
        }
      };
    }

    var hugeLabel, footerEl;
    var ulPrimaryNav = document.querySelector('ul[huge-primary-nav]');
    //TODO: Refactor this approach, this isn't optimal
    if(!ulPrimaryNav) { //Static elements, no need to re-render
      hugeLabel = utils.createElement('h1', null, 'HUGE', primaryNavHook);

      ulPrimaryNav = utils.createElement('ul', {'huge-primary-nav': ''}, null, primaryNavHook);

      footerEl = utils.createElement('footer', null, '&copy; 2016 Huge. All Rights Reserved.', primaryNavHook);
    }

    utils.removeAllChildElements(ulPrimaryNav);

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
      rootEl.removeAttribute('nav-close');
    } else {
      rootEl.setAttribute('nav-close', '');
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

    renderNav(state, rootEl);
  }

  function initApp() {
    document.getElementById('root').removeAttribute('class');
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
    //Exposing these methods for easier testing
    renderSecondaryNavItem: renderSecondaryNavItem,
    renderSecondaryNav: renderSecondaryNav,
    renderPrimaryNavItem: renderPrimaryNavItem,
    renderPrimaryNav, renderPrimaryNav,
    renderNavEnhancements: renderNavEnhancements,
    renderNav: renderNav,
    render: render,
    registerElement: registerElement
  });
};
