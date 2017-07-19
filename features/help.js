// Replies with help message.

function help(bot, controller) {
  let featureToggles = require('../feature-toggles');
  controller.hears(['help (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    let feature = message.match[1];
    if (feature in featureToggles) {
      let helpMessage = require(`${__dirname}/${feature}`).helpMessage;
      if (helpMessage) {
        bot.reply(message, helpMessage(bot, controller));
      } else {
        bot.reply(message, `No help message found for ${feature}.`);
      }
    } else {
      bot.reply(message, `No feature _${feature}_ found. Try \`@libotrio help\`.`);
    }
  });

  controller.hears(['help'], 'direct_message,direct_mention,mention', function(bot, message) {
    let enabledFeatures = Object.keys(featureToggles).filter((key) => featureToggles[key]);
    let disabledFeatures = Object.keys(featureToggles).filter((key) => !featureToggles[key]);
    bot.reply(message, {
      attachments: [
        {
          color: '#36a64f',
          title: 'Libotrio Features',
          title_link: 'http://github.com/liatrio/libotrio',
          pretext: `\`@${bot.identity.name} help <feature>\` for feature documentation`,
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

function helpMessage(bot, controller) {
  return `Displays enables/disabled features and documentation.
\`@${bot.identity.name} help\`
\`@${bot.identity.name} <feature>\``;
}

module.exports = {
  feature: help,
  helpMessage,
};
