const assert = require('assert');
const botMock = require('./mocks/botMock');
const SimpleStorage = require('../lib/storage/simple_storage');
const echoFeature = require('../features/echo').feature;

describe('echo tests', () => {

  beforeEach((done) => {
    var self = this;
    self.slackId = 'test';
    self.userName = 'test';
    self.controller = new botMock.controller(self.slackId, self.userName);

    self.controller.storage = SimpleStorage({path: 'tests/storage'});
    self.controller.bot.identity = {name: 'testName'};
    echoFeature(self.controller.bot, self.controller);

    done();
  });

  it('should repeat what the user says', (done) => {
    var self = this;
    return self.controller.usersInput([
      {
        first: true,
        user: self.slackId,
        messages: [{text: 'echo I should repeat this', isAssertion: true}]
      }
    ]).then((text) => {
      assert.equal(text.match('I should repeat this'). true);
    }).finally(done());
  });

});
