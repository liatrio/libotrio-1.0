const assert = require('assert');
const botMock = require('./mocks/botMock');
const birthdaysFeature = require('../features/birthdays').feature;

describe('birthdays tests', () => {

  beforeEach((done) => {
    var self = this;
    self.slackId = 'test';
    self.userName = 'test';
    self.controller = new botMock.controller(self.slackId, self.userName);

    self.controller.bot.identity = {name: 'testName'};
    birthdaysFeature(self.controller.bot, self.controller);

    done();
  });

  it('print out it\'s birthday', (done) => {
    var self = this;
    return self.controller.usersInput([
      {
        first: true,
        user: self.slackId,
        messages: [{text: 'when is your birthday?', isAssertion: true}]
      }
    ]).then((text) => {
      assert.equal(text.match('My first commit was July 19th, 2017!'). true);
    }).finally(done());
  });

});
