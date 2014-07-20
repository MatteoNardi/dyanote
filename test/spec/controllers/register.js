'use strict';

describe('Controller: RegisterCtrl', function () {
  beforeEach(module('dyanote'));

  var RegisterCtrl,
    scope,
    auth;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _auth_) {
    auth = _auth_;
    scope = $rootScope.$new();
    RegisterCtrl = $controller('RegisterCtrl', {
      $scope: scope
    });
  }));

  it('should regiter new users', function () {
    spyOn(auth, 'register');
    scope.form.email = 'user@example.com';
    scope.form.password = '123123';
    scope.form.passwordCheck = '123123';
    scope.register();
    expect(auth.register).toHaveBeenCalledWith('user@example.com', "123123");
  });

  it('should complain about mismatching passwords', function () {
    spyOn(auth, 'register');
    scope.form.email = 'user@example.com';
    scope.form.password = '123123';
    scope.form.passwordCheck = '1231234';
    scope.register();
    expect(scope.form.passwordCheckErrorMessage).toEqual('Passwords are different');
    expect(auth.register).not.toHaveBeenCalled();
  });
});
