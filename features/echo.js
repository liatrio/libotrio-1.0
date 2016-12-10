// Repeats a message spoken to libotrio. 

module.exports = function(bot, controller) {
  controller.hears(['echo (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, message.match[1]);
  });
}

