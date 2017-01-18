// Replies with help message.

module.exports = function(bot, controller) {
  let featureToggles = require('../feature-toggles');
  let enabledFeatures = Object.keys(featureToggles).filter((key) => featureToggles[key]);
  let disabledFeatures = Object.keys(featureToggles).filter((key) => !featureToggles[key]);
  controller.hears(['help'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, {
      attachments: [
        {
          color: '#36a64f',
          title: 'Libotrio Features',
          title_link: 'http://github.com/liatrio/libotrio',
          pretext: '`@' + bot.identity.name + ' help <feature>` for feature documentation (Coming Soon)',
          fields: [
            {
              'title': 'Enabled',
              'value': enabledFeatures.join(', '),
              'short': true,
            },
            {
              'title': 'Disabled',
              'value': disabledFeatures.join(', '),
              'short': true,
            }
          ],
        }
      ],
    });
  });
}

