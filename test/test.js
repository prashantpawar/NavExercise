var expect = chai.expect;

//These are the same util library from our app code, copy-pasted
utils = {
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
  },
  deepFreeze: function deepFreeze(o) {//This method allows us to ensure that an object remains immutable
    Object.freeze(o);

    Object.getOwnPropertyNames(o).forEach(function (prop) {
      if (o.hasOwnProperty(prop)
      && o[prop] !== null
      && (typeof o[prop] === "object" || typeof o[prop] === "function")
      && !Object.isFrozen(o[prop])) {
        deepFreeze(o[prop]);
      }
    });

    return o;
  }
};

describe('hugeApp', function() {
  var sandbox, xhr, mockDocument, requests,
    fakeDomElement, fakeNavAPIResponse,
    fixture, appRootEl;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    fakeDomElement = {
      removeAttribute: sandbox.stub()
    };

    fakeNavAPIResponse = {
      "items":[
          {
            "label":"Work",
            "url":"#/work",
            "items":[

            ]
          },
          {
            "label":"About",
            "url":"#/about",
            "items":[
                {
                  "label":"What we do",
                  "url":"#/about/what-we-do"
                },
                {
                  "label":"How we work",
                  "url":"#/about/how-we-work"
                },
                {
                  "label":"Leadership",
                  "url":"#/about/leadership"
                }
            ]
          }
      ]
    };

    mockDocument = {
      getElementById: sandbox.stub().returns(fakeDomElement)
    };

    /**
     * Fixture Setup
     **/
    fixture = document.getElementById('fixtures');

    appRootEl = utils.createElement('body', {'id': 'root', 'class': 'preload'}, null, fixture);

    hugeNavTag = utils.createElement('nav', {'huge-nav': ''}, null, appRootEl);

    hugePrimaryNavTag = utils.createElement('huge-primary-nav', null, null, hugeNavTag);

    /**
     * XHR setup
     **/
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];

    xhr.onCreate = function(xhr) {
      requests.push(xhr);
    };

  });

  afterEach(function () {
    sandbox.restore();
    xhr.restore();
    utils.removeAllChildElements(fixture);
  });

  describe('main module', function() {
    it('should be defined', function() {
      hugeApp = hugeAppConstructor(hugeApp, document, xhr);
      expect(hugeApp).to.be.defined;
    });

    it('should have an initialization method', function() {
      hugeApp = hugeAppConstructor(hugeApp, document, xhr);
      expect(hugeApp.initApp).to.be.defined;
    });

    it('should remove preload class from the root element', function() {
      hugeApp = hugeAppConstructor(hugeApp, document, xhr);
      hugeApp.initApp();

      expect(appRootEl.classList.contains('preload')).to.be.false;
    });

    describe('should load nav items by', function () {
      var ajaxURL = '/api/nav.json';
      beforeEach(function () {
        requests = [];
      });

      it('making an ajax call to ' + ajaxURL, function() {
        hugeApp = hugeAppConstructor(hugeApp, document, xhr);
        hugeApp.initApp();

        expect(requests.length).to.equal(1);
        expect(requests[0].url).to.equal(ajaxURL);
      });

      it('load Nav items from the API endpoint', function() {
        mockStore = {
          getState: sandbox.stub(),
          subscribe: sandbox.stub(),
          dispatch: sandbox.stub()
        }
        hugeApp.store.createStore = function () {
          return mockStore;
        };
        hugeApp = hugeAppConstructor(hugeApp, document, xhr);

        hugeApp.initApp();
        requests[0].respond(200, {'Content-Type': 'application/json'}, JSON.stringify(fakeNavAPIResponse));

        expect(mockStore.subscribe.called).to.be.true;
      });
    });
  });

  describe('reducers module', function() {
    it('should be defined', function() {
      expect(hugeApp.reducers).to.not.be.undefined;
    });

    describe('should return a reducer function', function () {
      var reducerFn, actions;
      beforeEach(function () {
        actions = hugeApp.actions(hugeApp, xhr);
        reducerFn = hugeApp.reducers(hugeApp, xhr).hugeAppReducer;
      });

      it('which should be defined', function() {
        expect(reducerFn).to.not.be.undefined;
      });

      it('which should return a default state with valid value', function() {
        state = reducerFn();
        expect(state.navOpen).to.not.be.defined;
        expect(['NARROW', 'WIDE']).to.contain(state.viewportType);
        expect(state.navItems.length).to.equal(0);
      });

      it('which should return the same state for invalid action', function () {
        var oldState = {
          navOpen: false,
          viewportType: actions.ViewportTypes.WIDE,
          navItems: []
        };

        var state = reducerFn(oldState, {type: 'Invalid Action'});
        expect(state).to.deep.equal(oldState);
      });

      describe('which should handle actions and not mutate state for', function () {
        it('NAV_OPEN action', function () {
          var oldState = {
            navOpen: false,
            viewportType: actions.ViewportTypes.WIDE,
            navItems: []
          };
          var newState = {
            navOpen: true,
            viewportType: actions.ViewportTypes.WIDE,
            navItems: []
          };

          utils.deepFreeze(oldState); //We freeze the oldState to prevent mutation

          var state = reducerFn(oldState, { type: actions.NAV_OPEN}); //this should set oldState.navOpen to true
          expect(state).to.deep.equal(newState);
        });

        it('NAV_CLOSE action', function () {
          var oldState = {
            navOpen: true,
            viewportType: actions.ViewportTypes.WIDE,
            navItems: []
          };
          var newState = {
            navOpen: false,
            viewportType: actions.ViewportTypes.WIDE,
            navItems: []
          };

          utils.deepFreeze(oldState); //We freeze the oldState to prevent mutation

          var state = reducerFn(oldState, { type: actions.NAV_CLOSE}); //this should set oldState.navOpen to true
          expect(state).to.deep.equal(newState);
        });

        it('VIEWPORT_CHANGE action', function () {
          var oldState = {
            navOpen: false,
            viewportType: actions.ViewportTypes.WIDE,
            navItems: []
          };
          var newState = {
            navOpen: false,
            viewportType: actions.ViewportTypes.NARROW,
            navItems: []
          };

          utils.deepFreeze(oldState); //We freeze the oldState to prevent mutation

          var state = reducerFn(oldState, {
            type: actions.VIEWPORT_CHANGE,
            viewportType: actions.ViewportTypes.NARROW
          });
          expect(state).to.deep.equal(newState);
        });

        it('NAV_ITEMS_LOADED action', function () {
          var oldState = {
            navOpen: false,
            viewportType: actions.ViewportTypes.WIDE,
            navItems: []
          };
          var newState = {
            navOpen: false,
            viewportType: actions.ViewportTypes.WIDE,
            navItems: fakeNavAPIResponse.items
          };

          utils.deepFreeze(oldState); //We freeze the oldState to prevent mutation

          var state = reducerFn(oldState, {
            type: actions.NAV_ITEMS_LOADED,
            navItems: fakeNavAPIResponse.items
          });
          expect(state).to.deep.equal(newState);
        });
      });
    });
  });

  describe('actions', function() {
    it('should be defined', function() {
      expect(hugeApp.actions).to.not.be.undefined;
    });
  });

  describe('store', function() {
    it('should be defined', function() {
      expect(hugeApp.store).to.not.be.undefined;
    });
  });
});
