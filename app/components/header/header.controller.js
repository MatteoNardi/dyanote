
class HeaderController {
  constructor (auth) {
    this.auth = auth;
  }

  get username () {
    return this.auth.getEmail();
  }
}

angular.module('dyanote').controller('HeaderController', HeaderController);