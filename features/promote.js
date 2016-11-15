// Triggers the Jenkins job to promote Libotrio from staging to production

var os = require('os');
var config = require('../package')
var request = require('request')

module.exports = function(bot, controller) {

    var jobTriggerUrl = 'https://build.liatrio.com/job/Libotrio/job/libotrio-deploy-production/build?token=libotrio-production'

    controller.hears(['promote to prod'],
            'direct_message,direct_mention,mention', function(bot, message) {

        request.get(jobTriggerUrl, function(error, response, body) {
            if (!error && response.statusCode == 200) {
              bot.reply(message,
                  ':robot_face: I am Libotrio v' + config.version +
                  '. I have been running for ' + uptime + ' on ' + hostname + '.');
            }
            else {
                bot.reply(message,':middle_finger:');
            }
        });
    });
}

