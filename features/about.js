var os = require('os');
var config = require('../package')

module.exports = function(bot, controller) {

    function formatUptime(uptime) {
        var unit = 'second';
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'minute';
        }
        if (uptime > 60) {
            uptime = uptime / 60;
            unit = 'hour';
        }
        if (uptime != 1) {
            unit = unit + 's';
        }

        uptime = uptime + ' ' + unit;
        return uptime;
    }

    controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name', 'about'],
            'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am Libotrio v' + config.version +
            '. I have been running for ' + uptime + ' on ' + hostname + '.');
    });

}
