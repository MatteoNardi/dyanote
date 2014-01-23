'use strict';

describe('Controller: LoginCtrl', function () {

  // load the controller's module
  beforeEach(module('dyanote'));

  var LoginCtrl, createController,
    scope, $log, $location, auth, loginResponse;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _$log_, _$location_, $q, _auth_) {
    loginResponse = $q.defer();
    $log = _$log_;
    $location = _$location_;
    auth = _auth_;
    spyOn(auth, 'loadFromSettings').andReturn(false);
    spyOn(auth, 'login').andReturn(loginResponse.promise);

    scope = $rootScope.$new();
    createController = function () {
      return $controller('LoginCtrl', {
        $scope: scope,
      });
    }
    LoginCtrl = createController();
  }));

  it('should redirect to notes if user is already logged in', function () {
    auth.loadFromSettings.andReturn(true);
    LoginCtrl = createController();
    expect($log.warn.logs.shift().shift()).toBe('User is already logged in');
    expect($location.path()).toBe('/notes');
  });

  it('should require mail', function () {
    scope.email = "";
    scope.login();
    expect(scope.emailErrorMessage).toBe("Email address is required");
  });

  it('should require password', function () {
    scope.password = "";
    scope.login();
    expect(scope.passwordErrorMessage).toBe("Password is required");
  });

  it('should require acceptable emails and passwords', function () {
    scope.email = "asd@";
    scope.password = "123";
    scope.login();
    expect(scope.emailErrorMessage).toBe("This is not a valid mail address");
    expect(scope.passwordErrorMessage).toBe("Password is too short");
  });

  it('should display loading animation', function () {
    scope.email = "asd@gmail.com";
    scope.password = "123456";
    expect(scope.isLoggingIn).toBe(false);
    scope.login();
    expect(scope.isLoggingIn).toBe(true);
    loginResponse.resolve();
    scope.$apply();
    expect(scope.isLoggingIn).toBe(false);
  });

  it('should display error message on failed login', function () {
    scope.email = "asd@gmail.com";
    scope.password = "123456";
    scope.login();
    loginResponse.reject();
    scope.$apply();
    expect(scope.errorMessage).toBe("Wrong username or password");
  });

  it('should change view on success', function () {
    scope.email = "asd@gmail.com";
    scope.password = "123456";
    scope.login();
    loginResponse.resolve();
    scope.$apply();
    expect($location.path()).toBe("/notes");
  });

  it('should save user to settings if "remembar me" is checked', function () {
    scope.email = "asd@gmail.com";
    scope.password = "123456";
    scope.remembar = true;
    scope.login();
    expect(auth.login).toHaveBeenCalledWith('asd@gmail.com', '123456', true);
  })
});
