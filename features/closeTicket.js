function closeTicket(bot, controller) {

  controller.hears(['close-ticket (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {

    var JIRA_CREDS = process.env.JIRA_API_CREDENTIALS;
    var JiraClient = require('jira-connector');
    var key = message.match[1];

    var jira = new JiraClient( {
      host: process.env.JIRA_HOST,
      protocol: process.env.JIRA_PROTOCOL,
      basic_auth: {
        username: JIRA_CREDS.split(":")[0],
        password: JIRA_CREDS.split(":")[1]
      }
    });

    jira.issue.getTransitions({ issueKey: key}, function(error, transitions) {
      if (error) {
        console.log(error);
        console.log('failure');
      }
      else {
        console.log(transitions);
        var transitionId = transitions.transitions[transitions.transitions.length-1].id
        var closed = { 
          update: { comment: [{ add: { body: "This ticket was closed via a Slack command." } }] },
          fields: {},
          transition: { id: `${transitionId}`}
        };
        jira.issue.transitionIssue({ issueKey: key, transition: closed}, function(error, issue) {
          if (error) {
            console.log(error);
          }
          else {
            console.log(issue);
            bot.reply(message, "Issue has been closed.");
          }
        });
      }
    });

  });

}

module.exports = {
  feature: closeTicket
};
