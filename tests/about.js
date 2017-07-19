const assert = require('assert');
const botMock = require('./mocks/botMock');
const SimpleStorage = require('../lib/storage/simple_storage');
const aboutFeature = require('../features/about').feature;

describe('about tests', () => {

  beforeEach((done) => {
    var self = this;
    self.slackId = 'test';
    self.userName = 'test';
    self.controller = new botMock.controller(self.slackId, self.userName);

    // Setup non-persistent storage for tests
    self.controller.storage = SimpleStorage({path: 'tests/storage'});

    // BotKit.SlackBot provides an identity attribute that botMock
    // does not, so we need to create a dummy attribute instead.
    self.controller.bot.identity = {name: 'testName'};

    // Install feature
    aboutFeature(self.controller.bot, self.controller);

    done();
  });

  it('should respond with uptime message when prompted', (done) => {
    var self = this;
    return self.controller.usersInput([
      {
        first: true,
        user: self.slackId,
        messages: [{text: 'uptime', isAssertion: true}]
      }
    ]).then((text) => {
      assert.equal(text.startsWith(':robot_face: I am Libotrio'), true);
      done();
    });
  });

});
