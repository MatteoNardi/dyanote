
describe ('AuthenticatedController', function () {
  beforeEach(module('dyanote'));

  // Dependencies
  var _ = {};
  beforeEach(inject(function ($controller, $location, $log, $q, $rootScope, auth, notesManager) {
    _.$controller = $controller;
    _.$location = $location;
    _.$log = $log;
    _.$q = $q;
    _.$rootScope = $rootScope;
    _.auth = auth;
    _.notesManager = notesManager;
  }));

  // Boilerplate
  var component,
    loadAllResponse;
  beforeEach(function () {
    component = _.$controller('AuthenticatedController');
    loadAllResponse = _.$q.defer();
    spyOn(_.notesManager, 'loadAll').and.returnValue(loadAllResponse.promise);
  });

  it('should not allow activation if user is not logged in', function () {
    spyOn(_.auth, 'isAuthenticated').and.returnValue(false);
    expect(component.canActivate()).toBe(false);
    var expectedMsg = 'AuthenticatedController canActivate: false (user not logged in)';
    expect(_.$log.info.logs.shift().shift()).toBe(expectedMsg);
  });

  it('should allow activation if notes have already been loaded', function () {
    _.notesManager.notesLoaded = true;
    expect(component.canActivate()).toBe(true);
    var expectedMsg = 'AuthenticatedController canActivate: true (notes already loaded)';
    expect(_.$log.info.logs.shift().shift()).toBe(expectedMsg);
  });

  it('should allow activation if notes can be loaded', function () {
    spyOn(_.auth, 'isAuthenticated').and.returnValue(true);
    var promise = component.canActivate(); 
    expect(promise).not.toBe(true);
    var response;
    promise.then(() => response = true);
    loadAllResponse.resolve();
    _.$rootScope.$new().$apply();
    expect(response).toBe(true);
    var expectedMsg = 'AuthenticatedController canActivate: true (loaded notes)';
    expect(_.$log.info.logs.shift().shift()).toBe(expectedMsg);
  });

  it('should not allow activation if notes cannot be loaded', function () {
    spyOn(_.auth, 'isAuthenticated').and.returnValue(true);
    var promise = component.canActivate(); 
    expect(promise).not.toBe(false);
    var response;
    promise.then(undefined, () => response = false);
    loadAllResponse.reject();
    _.$rootScope.$new().$apply();
    expect(response).toBe(false);
    var expectedMsg = 'AuthenticatedController canActivate: false (cant read notes)';
    expect(_.$log.warn.logs.shift().shift()).toBe(expectedMsg);
  });

  it('should redirect to /login if user is not logged in', function () {
    _.$location.path('/notes');
    expect(_.$location.path()).toBe('/notes');
    spyOn(_.auth, 'isAuthenticated').and.returnValue(false);
    component.canActivate();
    expect(_.$location.path()).toBe('/login');
  })
});