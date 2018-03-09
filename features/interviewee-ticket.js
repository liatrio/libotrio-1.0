// creates an interviewee ticket in Jira
function intervieweeTicket(bot, controller) {
  controller.hears(['asdf (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, message.match[1]);
  });
}

function helpMessage(bot, controller) {
  return `Creates an interviewee ticket in the Hiring Project.
\`@${bot.identity.name} create interviewee John Smith\` - Creates ticket for John Smith`;
}

module.exports = {
  feature: intervieweeTicket,
  helpMessage,
};
