function closeTicket(bot, controller) {

  controller.hears(['close-ticket (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {

    console.log(message);
    if (!message.match[1]) {
      bot.reply(message, "Please specify a ticket.");
    }
    else {
      var JIRA_CREDS = process.env.ATLASSIAN_USER + ":" + process.env.ATLASSIAN_PASS;
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
          bot.reply(message, "Oops! Looks like that ticket doesn't exist.");
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
    }

  });

}

module.exports = {
  feature: closeTicket
};
