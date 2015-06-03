jest.autoMockOff();

describe('surger', function() {
  describe('something', function() {
    it('does this', function() {
      var surge = require('./');
      expect(surge).toBeDefined();
    });
  });
});
