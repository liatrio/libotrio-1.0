const assert = require('assert');
const botMock = require('./mocks/botMock');
const bugFeature = require('../features/bug').feature;

describe('bug tests', () => {

  beforeEach((done) => {
    var self = this;
    self.slackId = 'test';
    self.userName = 'test';
    self.controller = new botMock.controller(self.slackId, self.userName);

    self.controller.bot.identity = {name: 'testName'};
    bugFeature(self.controller.bot, self.controller);

    done();
  });

  it('should inform the user that bug reporting is coming', (done) => {
    var self = this;
    return self.controller.usersInput([{
      first: true,
      user: self.slackId,
      messages: [{text: 'bug something here', isAssertion: true}]
    }]).then((text) => {
      assert.equal(text.match('bug reporting feature coming soon! Let the tools team know when something is breaking'). true);
    }).finally(done());
  });

});
