
describe('LoginController', function () {
  beforeEach(module('dyanote'));

  // Dependencies
  var _ = {};
  beforeEach(inject(function ($controller, $location, $log, $q, $rootScope, auth) {
    _.auth = auth;
    _.$controller = $controller;
    _.$location = $location;
    _.$log = $log;
    _.$q = $q;
    _.$rootScope = $rootScope;
  }));

  // Boilerplate
  var component,
    loginResponse;
  beforeEach(function () {
    component = _.$controller('LoginController');
    loginResponse = _.$q.defer();
    spyOn(_.auth, 'login').and.returnValue(loginResponse.promise);
  });

  it('should redirect to notes if user is already logged in', function () {
    spyOn(_.auth, 'isAuthenticated').and.returnValue(true);
    var expectedMsg = 'LoginController canActivate: false (User is already logged in)';

    expect(component.canActivate()).toBe(false);
    expect(_.$log.info.logs.shift().shift()).toBe(expectedMsg);
    expect(_.$location.path()).toBe('/notes');
  });

  it('should redirect to notes if user can be loaded from localStorage', function () {
    spyOn(_.auth, 'isAuthenticated').and.returnValue(false);
    spyOn(_.auth, 'loadFromSettings').and.returnValue(true);
    var expectedMsg = 'LoginController canActivate: false (User is already logged in)';

    expect(component.canActivate()).toBe(false);
    expect(_.$log.info.logs.shift().shift()).toBe(expectedMsg);
    expect(_.$location.path()).toBe('/notes');
  });

  it('should display loading animation', function () {
    component.activate();
    component.form.email = "asd@gmail.com";
    component.form.password = "123456";
    expect(component.form.isLoggingIn).toBe(false);
    component.login();
    expect(component.form.isLoggingIn).toBe(true);
    loginResponse.resolve();
    _.$rootScope.$new().$apply();
    expect(component.form.isLoggingIn).toBe(false);
  });

  it('should display error message on failed login', function () {
    component.activate();
    component.form.email = "asd@gmail.com";
    component.form.password = "123456";
    component.login();
    loginResponse.reject();
    _.$rootScope.$new().$apply();
    expect(component.form.failure).toBe(true);
  });

  it('should change view on success', function () {
    component.activate();
    component.login();
    loginResponse.resolve();
    _.$rootScope.$new().$apply();
    expect(_.$location.path()).toBe('/notes');
  });

  it('should save user to settings if "remember me" is checked', function () {
    component.activate();
    component.form.email = "asd@gmail.com";
    component.form.password = "123456";
    component.form.remember = true;
    component.login();
    expect(_.auth.login).toHaveBeenCalledWith('asd@gmail.com', '123456', true);
  })
});
