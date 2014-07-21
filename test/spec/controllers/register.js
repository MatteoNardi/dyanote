'use strict';

describe('Controller: RegisterCtrl', function () {
  beforeEach(module('dyanote'));

  var RegisterCtrl,
    scope,
    auth,
    deferred;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, $q, _auth_) {
    auth = _auth_;
    scope = $rootScope.$new();
    RegisterCtrl = $controller('RegisterCtrl', {
      $scope: scope
    });

    // Promises returned by $http have these extra methods:
    deferred = $q.defer();
    var p = deferred.promise;
    p.success = function(fn) {
      p.then(fn);
      return p;
    };
    p.error = function(fn) {
      p.then(undefined, function(rejection) {
        fn(undefined, rejection.status);
      });
      return p;
    };
    
    spyOn(auth, 'register').andReturn(p);
  }));

  it('should regiter new users', function ($q) {
    scope.form.email = 'user@example.com';
    scope.form.password = '123123';
    scope.form.passwordCheck = '123123';
    scope.register();
    deferred.resolve();
    scope.$apply();
    expect(auth.register).toHaveBeenCalledWith('user@example.com', "123123");
    expect(scope.form.successMessage).toEqual('You received an activation mail.');
  });

  it('should complain about mismatching passwords', function () {
    scope.form.email = 'user@example.com';
    scope.form.password = '123123';
    scope.form.passwordCheck = '1231234';
    scope.register();
    expect(scope.form.passwordCheckErrorMessage).toEqual('Passwords are different');
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('should complain about missing email', function () {
    scope.form.email = '';
    scope.form.password = '123123';
    scope.form.passwordCheck = '1231234';
    scope.register();
    expect(scope.form.emailErrorMessage).toEqual('Email address is required');
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('should complain about malformed email', function () {
    scope.form.email = 'malformed!gmail.com';
    scope.form.password = '123123';
    scope.form.passwordCheck = '1231234';
    scope.register();
    expect(scope.form.emailErrorMessage).toEqual('This is not a valid mail address');
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('should complain too short passwords', function () {
    scope.form.email = 'user@example.com';
    scope.form.password = '123';
    scope.form.passwordCheck = '123';
    scope.register();
    expect(scope.form.passwordErrorMessage).toEqual('Password is too short');
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('should complain about email address already in use', function () {
    scope.form.email = 'user@example.com';
    scope.form.password = '123123';
    scope.form.passwordCheck = '123123';
    scope.register();
    deferred.promise.error = function(fn) {fn(409, 'User already exists')};
    deferred.reject({status: 409 /*CONFLICT*/});
    scope.$apply();
    expect(scope.form.emailErrorMessage).toEqual('This mail address is already in use');
  });
});
