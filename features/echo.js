// Repeats a message spoken to libotrio.
function echo(bot, controller) {
  controller.hears(['echo (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, message.match[1]);
  });
}

function helpMessage(bot, controller) {
  return `Repeats a message.
\`@${bot.identity.name} echo I'm a robot\``;
}

module.exports = {
  feature: echo,
  helpMessage,
};
