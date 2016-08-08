var expect = chai.expect;
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
    appRootEl = document.createElement('body');
    appRootEl.setAttribute('id', 'root');
    appRootEl.setAttribute('class', 'preload');
    fixture.appendChild(appRootEl);

    /**
     * XHR setup
     **/
    xhr = sinon.useFakeXMLHttpRequest();
    requests = [];

    xhr.onCreate = function(xhr) {
      requests.push(xhr);
    };

    window.hugeApp = window.hugeApp.main(window.hugeApp, document, xhr);
  });

  afterEach(function () {
    sandbox.restore();
    xhr.restore();
    fixture.removeChild(appRootEl);
  });

  describe('main module', function() {
    it('should be defined', function() {
      expect(hugeApp).to.be.defined;
    });

    it('should have an initialization method', function() {
      expect(hugeApp.initApp).to.be.defined;
    });

    it('should remove preload class from the root element', function() {
      hugeApp.initApp();

      expect(appRootEl.classList.contains('preload')).to.be.false;
    });

    it('should load nav items from the ajax call', function() {
      var ajaxURL = '/api/nav.json';
      
      hugeApp.initApp();
      console.log(requests);
      expect(requests.length).to.equal(1);
    });
  });

  describe('reducers', function() {
    it('should be defined', function() {
      expect(hugeApp.reducers).to.not.be.undefined;
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
