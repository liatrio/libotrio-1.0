function whoami(bot, controller) {

  controller.hears(['what is my name', 'who am i', 'whoami'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
      if (user) {
        bot.api.users.info({user : message.user}, function(err, res) {
          bot.reply(message, 'Your name will show as ' + res.user.profile.display_name);
        })
      } else {
        bot.reply(message, 'Oops, There appears to be a problem!'); 
      }
    });
  });
}

function helpMessage(bot, controller) {
  return `Figure out what Libotrio calls you.
  \`@${bot.identity.name} whoami\``;
}

module.exports = {
  feature: whoami,
  helpMessage,
};
