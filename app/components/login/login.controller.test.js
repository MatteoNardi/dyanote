
describe('LoginController', function () {
  // Dependencies
  var _ = {},
    LoginController;

  beforeEach(() => {
    // Mock backend
    module('dyanote', function($provide) {
      _.backend = {};
      $provide.value('backend', _.backend);
    });

    // Inject services
    inject (($controller, $location, $q, $log, $rootScope) => {
      _.$controller = $controller;
      _.$location = $location;
      _.$rootScope = $rootScope;
    });

    // Create controller
    _.backend.isAuthenticated = () => false;
    LoginController = _.$controller('LoginController', { $scope: _.$rootScope.$new() });
  });

  it('should be able to activate when user is not authenticated', function () {
    expect(LoginController.canActivate()).toBe(true);
  });

  it('should redirect to notes if user is already logged in', function () {
    _.$rootScope.$apply(() => {
      _.backend.isAuthenticated = () => true;
    });
    expect(LoginController.canActivate()).toBe(false);
    expect(_.$location.path()).toBe('/notes');
  });
});
