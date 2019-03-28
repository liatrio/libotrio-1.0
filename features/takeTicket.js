const JiraClient = require('jira-connector');
const request = require('request');

const atlassianUser = process.env.ATLASSIAN_USER;
const atlassianPass = process.env.ATLASSIAN_PASS;

if (!atlassianUser || !atlassianPass) {
  console.error('ERR: Jira take ticket feature requires ATLASSIAN_USER and ATLASSIAN_PASS env vars.');
  exit(1);
}

const jiraClient = new JiraClient( {
  host: process.env.JIRA_HOST,
  protocol: process.env.JIRA_PROTOCOL,
  basic_auth: {
    username: atlassianUser,
    password: atlassianPass
  }
});

const auth = "Bearer " + process.env.SLACK_ACCESS_TOKEN;

const options = {
  method: 'GET', url: 'https://liatrio.slack.com/api/users.list',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': auth }
};

function assignTicket(bot, message, key, user) {
  jiraClient.issue.assignIssue({ issueKey: key, assignee: user}, function(error, issue) {
    if (error) {
      bot.reply(message, 'Oops! Something went wrong.');
      console.log(error);
    }
  });
}

function takeTicket(bot, controller) {

  controller.hears(['assign-me (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    if (!message.match[1]) {
      bot.reply(message, "Please specify a ticket.");
    } else {
      var key = message.match[1];

      request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          const users = JSON.parse(body);

          for (var i = 0; i < users.members.length; i++){
            if (users.members[i].id == message.user){
              assignTicket(bot, message, key, users.members[i].profile.email.split("@")[0])

              jiraClient.issue.getIssue({ issueKey: key}, function(error, is) {
                if (error) { bot.reply(message, 'Oops! Something went wrong.'); console.log(error); }
                else {
                  console.log("Working on issue " + is.fields.summary + " in project " + is.fields.project.key)
                  var bitbucketUrl = process.env.BITBUCKET_PROTOCOL + "://" + atlassianUser + ":" + atlassianPass + "@" + process.env.BITBUCKET_HOST + "/rest/api/1.0/" + "projects/" + is.fields.project.key + "/repos"
                  console.log(bitbucketUrl)
                  request({url: bitbucketUrl}, function(err, res, bod) {
                    if (err) {
                      bot.reply(message, 'Oops! Something went wrong.');
                      console.log(error);
                    }
                    var actions = [];
                    var callbacks = [];
                    var repos = JSON.parse(bod);

                    // Repo does not exist on bitbucket
                    if (repos.errors) {
                      // Implement github repo check here
                      console.log("Repo does not exist for project " + is.fields.project.key)
                    }  else {
                      // Repo exists on bitbucket
                      for (var i = 0; i < repos.values.length; i++){
                        var action = { type: "button", name: `${repos.values[i].slug}`, text: `${repos.values[i].slug}`, value: `${repos.values[i].slug}` }
                        var callback = {
                          pattern: `${repos.values[i].slug}`,
                          callback: function(reply, convo) {
                            bitbucketUrl = process.env.BITBUCKET_PROTOCOL + "://" + atlassianUser + ":" + atlassianPass + "@" + process.env.BITBUCKET_HOST + "/rest/branch-utils/1.0/"
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
                                var link = process.env.BITBUCKET_PROTOCOL + "://" + process.env.BITBUCKET_HOST + "/projects/" + key.split("-")[0] + "/repos/" + "pipeline-demo-application" + "/browse"
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
