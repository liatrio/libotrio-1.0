function takeTicket(bot, controller) {

  controller.hears(['assign-me (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    if (!message.match[1]) {
      bot.reply(message, "Please specify a ticket.");
    }
    else {
      const request = require('request');
      var JiraClient = require('jira-connector');

      var JIRA_CREDS = process.env.ATLASSIAN_USER + ":" + process.env.ATLASSIAN_PASS;
      var jira = new JiraClient( {
        host: process.env.JIRA_HOST,
        protocol: process.env.JIRA_PROTOCOL,
        basic_auth: {
          username: JIRA_CREDS.split(":")[0],
          password: JIRA_CREDS.split(":")[1]
        }
      });
      const auth = "Bearer " + process.env.SLACK_ACCESS_TOKEN;
      const key = message.match[1];
      const options = { 
        method: 'GET', url: 'https://liatrio.slack.com/api/users.list',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': auth }
      };
      request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          const list = JSON.parse(body);
          for (var i = 0; i < list.members.length; i++){
            if (list.members[i].id == message.user){
              console.log(message.user);
              console.log(key);
              jira.issue.assignIssue({ issueKey: key, assignee: list.members[i].profile.email.split("@")[0]}, function(error, issue) {
                if (error) { bot.reply(message, 'Oops! Something went wrong.'); console.log(error); }
                else {
                  jira.issue.getIssue({ issueKey: key}, function(error, is) {
                    if (error) { bot.reply(message, 'Oops! Something went wrong.'); console.log(error); }
                    else {
                      var bitbucketUrl = process.env.JIRA_PROTOCOL + "://" + process.env.ATLASSIAN_USER + ":" + process.env.ATLASSIAN_PASS + "@" + process.env.BITBUCKET_HOST + "/rest/api/1.0/"
                      request({url: bitbucketUrl + `projects/${is.fields.project.key}/repos`}, function(err, res, bod) {
                        var actions = [];
                        var callbacks = [];
                        var repos = JSON.parse(bod);

                        for (var i = 0; i < repos.values.length; i++){
                          var action = { type: "button", name: `${repos.values[i].slug}`, text: `${repos.values[i].slug}`, value: `${repos.values[i].slug}` }
                          var callback = { 
                            pattern: `${repos.values[i].slug}`, 
                            callback: function(reply, convo) { 
                              bitbucketUrl = process.env.JIRA_PROTOCOL + "://" + process.env.ATLASSIAN_USER + ":" + process.env.ATLASSIAN_PASS + "@" + process.env.BITBUCKET_HOST + "/rest/branch-utils/1.0/"
                              var branch = key + "-" + is.fields.description.replace(/ /g, "-");
                              var postData = {
                                name: branch,
                                startPoint: "refs/heads/master"
                              }
                              request({url: bitbucketUrl + "projects/" +  key.split("-")[0] + "/repos/" + reply.text + "/branches", 
                                       headers: { 'X-Atlassian-Token': 'no-check' }, json: true,
                                       method: 'post', body: postData}, function(err, res, bod) {
                                if (error) { console.log(err); }
                                else { 
                                  var link = "http://bitbucket.liatr.io/projects/" + key.split("-")[0] + "/repos/" + "pipeline-demo-application" + "/browse"
                                  convo.say(`branch has been made on the repo <${link}|${reply.text}>` + " with the branch name `" + branch + "`"); 
                                  convo.next(); 
                                }
                              });
                            } 
                          }

                          actions.push(action);
                          callbacks.push(callback);
                        }
                        var callback = { 
                          default: true, 
                          callback: function(reply, convo) { 
                            console.log(reply); 
                            convo.say('cool stuff!');
                          } 
                        }
                        callbacks.push(callback);

                        let msg = {
                          text: "Issue has been assigned to you. Want to create a branch?",
                          attachments: [{
                            fallback: 'actions',
                            callback_id: "take_ticket_callback",
                            actions: actions
                          }]
                        };
                        bot.startConversation(message, function(err, convo) {
                          convo.ask(msg, callbacks);
                        });
                      });
                    }
                  });
                }
              });
            }
          }
        }
        else {
          console.log(error);
        }
      });
    }
  });


}

module.exports = {
  feature: takeTicket
};
