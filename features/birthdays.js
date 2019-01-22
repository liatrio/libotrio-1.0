/*
 * birthday reminders
 *
 * Display basic information about Libotrio.
 *
*/

function birthdays(bot, controller) {
  controller.hears(['when is your birthday?'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, "My first commit was July 19th, 2017!");
  });
}

function helpMessage(bot, controller) {
  return `Birthday reminders feature coming soon! Helping to not forget eachother's birthday anymore`;
}

module.exports = {
  feature: birthdays,
  helpMessage,
};
