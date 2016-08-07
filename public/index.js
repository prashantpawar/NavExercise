console.log("index.js loaded");

window.hugeApp = {};

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
    changeViewport: changeViewport,
    loadNavItems: loadNavItems
  }
}(window.hugeApp));

window.hugeApp.reducers = (function (hugeApp) {
  var actions = hugeApp.actions;
  var ViewportTypes = actions.ViewportTypes;

  var initialState = {
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

  /**
  function addPrimaryNavItem(state, rootEl) {
      
  }

  function addSecondaryNavItem(state, rootEl) {
      
  }

  function setNavType(state, rootEl) {
    if(state === actions.NARROW) {
      rootEl.setAttribute('hamburger-menu', 'show');
    }
    return rootEl;
  }

  function renderNav(state, rootEl) {
    rootEl.querySelector('[huge-nav]');
    setNavType(state.viewportType, rootEl);
    state.items.map(function (item) {
      addNavItem(item, rootEl);
    });

    var ulElement = document.createElement('ul');
    ul.setAttribute('huge-primary-nav');

    return rootEl;
  }
  **/

  function render(state, rootEl) {
    if(typeof rootEl === 'undefined') {
      rootEl = document.getElementById('root');
    }
    console.log(store.getState());
    //renderNav(state, rootEl);
  }

  function initApp() {
    console.log("app being initialized", hugeApp);
    /**
     * SETUP
     **/
    store = createStore(reducers.hugeAppReducer);
    store.subscribe(render);
    render(store.getState());
    /**
     * END SETUP
     **/

    store.dispatch(actions.loadNavItems());

    document.addEventListener('click', function () {
      store.dispatch(actions.changeViewport(actions.ViewportTypes.NARROW));
    });
  }

  return Object.assign({}, hugeApp, {
    initApp: initApp,
    registerElement: function registerElement(elementName) {
      var customEl = document.registerElement(elementName);
      return customEl;
    }
  });
}(window.hugeApp, document));

document.addEventListener('DOMContentLoaded', hugeApp.initApp);
