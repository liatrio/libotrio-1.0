// Triggers the Jenkins job to promote Libotrio from staging to production

var os = require('os');
var config = require('../package')
var request = require('request')

module.exports = function(bot, controller) {

    var jobTriggerUrl = 'https://admin:' + process.env.JENKINS_API_KEY + '@build.liatrio.com/job/Libotrio/job/libotrio-deploy-production/build?token=libotrio-production-deploy'
    console.log(jobTriggerUrl);

    controller.hears(['promote to prod'],
            'direct_message,direct_mention,mention', function(bot, message) {

        request.get({
          'rejectUnauthorized': false,
          'url': jobTriggerUrl,
        }, function (error, response, body) {
            console.log(error);
            if (!error && (response.statusCode == 200 || response.statusCode == 201)) {
              bot.reply(message, 'Deployment job triggered');
            }
            else {
                bot.reply(message,':middle_finger: ' + response.statusCode + ' ' + error);
            }
        });

    });
}

