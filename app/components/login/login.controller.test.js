
describe('LoginController', function () {
  beforeEach(module('dyanote'));


  // Dependencies
  var _ = {};
  beforeEach(inject(function ($controller, $location, $log, auth) {
    _.auth = auth;
    _.$controller = $controller;
    _.$location = $location;
    _.$log = $log;
  }));

  // // Initialize the controller and a mock scope
  // beforeEach(inject(function ($controller, $rootScope, _$log_, _$location_, $q, _auth_) {

  //   loginResponse = $q.defer();
  //   $log = _$log_;
  //   $location = _$location_;
  //   auth = _auth_;
  //   spyOn(auth, 'loadFromSettings').and.returnValue(false);
  //   spyOn(auth, 'login').and.returnValue(loginResponse.promise);

  //   scope = $rootScope.$new();
  //   createController = function () {
  //     return $controller('LoginController', {
  //       $scope: scope,
  //     });
  //   }
  //   LoginController = createController();
  // }));

  it('should redirect to notes if user is already logged in', function () {
    spyOn(_.auth, 'isAuthenticated').and.returnValue(true);
    var component = _.$controller('LoginController'),
      expectedMsg = 'LoginController canActivate: false (User is already logged in)',
      output = component.canActivate();
    expect(output).toBe(false);
    expect(_.$log.info.logs.shift().shift()).toBe(expectedMsg);
    expect(_.$location.path()).toBe('/notes');
  });

  it('should redirect to notes if user can be loaded from localStorage', function () {
    spyOn(_.auth, 'isAuthenticated').and.returnValue(false);
    spyOn(_.auth, 'loadFromSettings').and.returnValue(true);
    var component = _.$controller('LoginController'),
      expectedMsg = 'LoginController canActivate: false (User is already logged in)',
      output = component.canActivate();
    expect(output).toBe(false);
    expect(_.$log.info.logs.shift().shift()).toBe(expectedMsg);
    expect(_.$location.path()).toBe('/notes');
  });

  xit('should require mail', function () {
    scope.form.email = "";
    scope.login();
    expect(scope.form.emailErrorMessage).toBe("Email address is required");
  });

  xit('should require password', function () {
    scope.form.password = "";
    scope.login();
    expect(scope.form.passwordErrorMessage).toBe("Password is required");
  });

  xit('should require acceptable emails and passwords', function () {
    scope.form.email = "asd@";
    scope.form.password = "123";
    scope.login();
    expect(scope.form.emailErrorMessage).toBe("This is not a valid mail address");
    expect(scope.form.passwordErrorMessage).toBe("Password is too short");
  });

  xit('should display loading animation', function () {
    scope.form.email = "asd@gmail.com";
    scope.form.password = "123456";
    expect(scope.form.isLoggingIn).toBe(false);
    scope.login();
    expect(scope.form.isLoggingIn).toBe(true);
    loginResponse.resolve();
    scope.$apply();
    expect(scope.form.isLoggingIn).toBe(false);
  });

  xit('should display error message on failed login', function () {
    scope.form.email = "asd@gmail.com";
    scope.form.password = "123456";
    scope.login();
    loginResponse.reject();
    scope.$apply();
    expect(scope.form.errorMessage).toBe("Wrong username or password");
  });

  xit('should change view on success', function () {
    scope.form.email = "asd@gmail.com";
    scope.form.password = "123456";
    scope.login();
    loginResponse.resolve();
    scope.$apply();
    expect($location.path()).toBe("/notes");
  });

  xit('should save user to settings if "remember me" is checked', function () {
    scope.form.email = "asd@gmail.com";
    scope.form.password = "123456";
    scope.form.remember = true;
    scope.login();
    expect(auth.login).toHaveBeenCalledWith('asd@gmail.com', '123456', true);
  })
});
