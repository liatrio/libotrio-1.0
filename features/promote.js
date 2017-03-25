// Triggers the Jenkins job to promote Libotrio from staging to production

var os = require('os');
var config = require('../package');
var request = require('request');

const jenkinsUser = process.env.JENKINS_USER
const jenkinsApiToken = process.env.JENKINS_API_TOKEN
const deployTriggerUrl = process.env.LIBOTRIO_DEPLOY_TRIGGER_URL
const authedDeployTriggerUrl = `https://${jenkinsUser}:${jenkinsApiToken}@${deployTriggerUrl}`

function promote(bot, controller) {
  if (!(jenkinsUser && jenkinsApiToken && deployTriggerUrl)) {
    console.error('Promote feature requires JENKINS_USER, JENKINS_API_TOKEN, LIBOTRIO_DEPLOY_TRIGGER_URL environment variables.');
    return;
  }

  controller.hears(['promote to prod'], 'direct_message,direct_mention,mention', function(bot, message) {
    request.get({
      'rejectUnauthorized': false,
      'url': authedDeployTriggerUrl,
    }, function (error, response, body) {
      if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
        bot.reply(message, 'Deployment job triggered');
      }
      else {
        bot.reply(message,':middle_finger: ' + response.statusCode + ' ' + error);
      }
    });
  });
}

function helpMessage(bot, controller) {
  return `Promote Libotrio version in staging to production.
\`@${bot.identity.name} promote to prod\``;
}

module.exports = {
  feature: promote,
  helpMessage,
};
