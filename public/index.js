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
      dispatch: function (action) {
        state = reducer(this.getState(), action);

        callbacks.map(function (cb) {
          cb(state); 
        });
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

  function changeViewport(viewportType) {
    return {
      type: VIEWPORT_CHANGE,
      viewportType: viewportType
    }
  }

  function navItemsLoaded(navItems) {
    return {
      type: NAV_ITEMS_LOADED,
      navItems: navItems
    }
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
    navItemsLoaded: navItemsLoaded
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

  function render(state) {
    console.log(store.getState());
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
