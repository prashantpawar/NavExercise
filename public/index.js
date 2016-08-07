console.log("index.js loaded");

window.hugeApp = {};

window.hugeApp.store = (function (hugeApp) {
  var callbacks = [];
  var state;
  function createStore(reducer) {
    return {
      getState: function () {
        return state;
      },
      dispatch: function (action) {
        state = reducer(this.getState(), action);
        console.log("state inside store", state, action);

        callbacks.map(function (cb) {
          cb(); 
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
  var MENU_ITEMS_LOADED = 'MENU_ITEMS_LOADED';

  function changeViewport(viewportType) {
    return {
      type: VIEWPORT_CHANGE,
      viewportType: viewportType
    }
  }

  function menuItemsLoaded(menuItems) {
    return {
      type: MENU_ITEMS_LOADED,
      menuItems: menuItems
    }
  }

  return {
    /**
    * Action types
    **/
    VIEWPORT_CHANGE: VIEWPORT_CHANGE,
    MENU_ITEMS_LOADED: MENU_ITEMS_LOADED,

    /**
    * Other constants
    **/
    ViewportTypes: {
      HAMBURGER_MENU: 'HAMBURGER_MENU',
      STANDARD_MENU: 'STANDARD_MENU'
    },

    /**
    * Action Creators
    **/
    changeViewport: changeViewport,
    menuItemsLoaded: menuItemsLoaded
  }
}(window.hugeApp));

window.hugeApp.reducers = (function (hugeApp) {
  var actions = hugeApp.actions;
  var ViewportTypes = actions.ViewportTypes;

  var initialState = {
    viewportType: ViewportTypes.STANDARD_MENU,
    items: []
  };

  return {
    hugeAppReducer: function (state, action) {
      console.log("inside reducer", state, action);
      if(typeof state === 'undefined') {
          state = initialState;
      }

      switch(action.type) {
        case action.VIEWPORT_CHANGE:
          return Object.assign({}, state, {
            viewportType: action.viewportType
          });
        case action.MENU_ITEMS_LOADED:
          return Object.assign({}, state, {
            items: action.items 
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

  function initApp() {
    console.log("app being initialized", hugeApp);
    store = createStore(reducers.hugeAppReducer);
    function render () {
      console.log(store.getState());
    }
    store.subscribe(render);
    render();

    document.addEventListener('click', function () {
      store.dispatch(actions.changeViewport(actions.ViewportTypes.HAMBURGER_MENU));
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
