'use strict';

describe('Service: notifications', function () {
  beforeEach(module('dyanote'));

  var notifications;
  beforeEach(inject(function (_notifications_) {
    notifications = _notifications_;
  }));

  it('should start empty', function () {
    expect(notifications.notifications.length).toBe(0);
  });

  it('should log notifications', function () {
    notifications.warn('Msg0')
    notifications.info('Msg1')
    notifications.success('Msg2')
    expect(notifications.notifications.length).toBe(3);
    expect(notifications.notifications[0].label).toBe('Msg0');
    expect(notifications.notifications[1].label).toBe('Msg1');
    expect(notifications.notifications[2].label).toBe('Msg2');
  });
});
