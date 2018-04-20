/*
 * help
 *
 * Display helpful information about each command.
 *
*/

let featureToggles = require('../feature-toggles');

let help = (bot, controller) => {
  controller.hears(['help (.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
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

  controller.hears(['help'], 'direct_message,direct_mention,mention', (bot, message) => {
    let enabledFeatures = Object.keys(featureToggles).filter((key) => featureToggles[key]);
    let disabledFeatures = Object.keys(featureToggles).filter((key) => !featureToggles[key]);
    bot.reply(message, {
      attachments: [
        {
          color: '#36a64f',
          title: 'Libotrio Features\n',
          title_link: 'http://github.com/liatrio/libotrio',
          pretext: `\nDisplay feature documenation.\n\`@${bot.identity.name} help <feature>\`\n`,
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

  controller.hears(['(.*)'], 'direct_message,direct_mention,mention', (bot, message) => {
    let feature = message.match[0];
    if (feature in featureToggles === false) {
      bot.reply(message, `No feature _${feature}_ found. Try \`@libotrio help\`.`);
    }
  });
}

let helpMessage = (bot, controller) => {
  return `Display enables/disabled features and documentation.\n
\`@${bot.identity.name} help <feature>\`\n`;
}

module.exports = {
  feature: help,
  helpMessage
};

