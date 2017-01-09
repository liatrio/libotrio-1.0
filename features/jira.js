// Matches Jira tickets in messages and links to the jira ticket.

module.exports = function(bot, controller) {
  controller.hears(['([a-zA-Z]+-[0-9]+)'], ['direct_message', 'mention', 'direct_mention', 'ambient'], function(bot, message) {
    // Match all ticket keys and map them to upper case
    let tickets = message.text.match(/([A-Z]+-[0-9]+)/gi).map((m) => m.toUpperCase());
		let formattedUrls = tickets.map((t) => `https://liatrio.atlassian.net/browse/${t}`);
    bot.reply(message, formattedUrls.join(', '));
  });
}
