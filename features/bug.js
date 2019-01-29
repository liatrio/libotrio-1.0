// report a bug to the chatops team
function bug(bot, controller) {
  controller.hears(['bug (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, "bug reporting feature coming soon! Let the tools team know when something is breaking");
  });
}

function helpMessage(bot, controller) {
  return `Under construction. This feature will let you tell the libotrio team that there is a problem.`;
}

module.exports = {
  feature: bug,
  helpMessage,
};
