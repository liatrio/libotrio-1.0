function takeTicket(bot, controller) {

  controller.hears(['assign-me (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.startConversation(message, function(err, convo) {

    convo.ask({
        attachments:[
            {
                title: 'Do you want to proceed?',
                callback_id: '123',
                attachment_type: 'default',
                actions: [
                    {
                        "name":"yes",
                        "text": "Yes",
                        "value": "yes",
                        "type": "button",
                    },
                    {
                        "name":"no",
                        "text": "No",
                        "value": "no",
                        "type": "button",
                    }
                ]
            }
        ]
    },[
        {
            pattern: "yes",
            callback: function(reply, convo) {
                convo.say('FABULOUS!');
                convo.next();
                // do something awesome here.
            }
        },
        {
            pattern: "no",
            callback: function(reply, convo) {
                convo.say('Too bad');
                convo.next();
            }
        },
        {
            default: true,
            callback: function(reply, convo) {
                // do nothing
            }
        }
    ]);
});
    //const request = require('request');
    //var JiraClient = require('jira-connector');

    //var JIRA_CREDS = process.env.JIRA_API_CREDENTIALS;
    //var jira = new JiraClient( {
    //  host: process.env.JIRA_HOST,
    //  protocol: "http",
    //  basic_auth: {
    //    username: JIRA_CREDS.split(":")[0],
    //    password: JIRA_CREDS.split(":")[1]
    //  }
    //});
    //const auth = "Bearer " + process.env.SLACK_ACCESS_TOKEN;
    //const key = message.match[1];
    //const options = { 
    //  method: 'GET', url: 'https://liatrio.slack.com/api/users.list',
    //  headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Authorization': auth }
    //};
    //request(options, function(error, response, body) {
    //  if (!error && response.statusCode == 200) {
    //    const list = JSON.parse(body);
    //    for (var i = 0; i < list.members.length; i++){
    //      if (list.members[i].id == message.user){
    //        jira.issue.assignIssue({ issueKey: key, assignee: list.members[i].profile.email.split("@")[0]}, function(error, issue) {
    //          if (error) { bot.reply(message, 'failure'); console.log(error); }
    //          else {
    //            jira.issue.getIssue({ issueKey: key}, function(error, is) {
    //              if (error) { console.log(error); }
    //              else {
    //                var bitbucketUrl = "http://" + JIRA_CREDS + "@bitbucket.liatr.io/rest/api/1.0/"
    //                request({url: bitbucketUrl + `projects/${is.fields.project.key}/repos`}, function(err, res, bod) {
    //                  var actions = [];
    //                  var callbacks = [];
    //                  var repos = JSON.parse(bod);

    //                  for (var i = 0; i < repos.values.length; i++){
    //                    var action = { type: "button", name: `${repos.values[i].slug}`, text: `${repos.values[i].slug}`, value: `${repos.values[i].slug}` }
    //                    var callback = { 
    //                      pattern: `${repos.values[i].slug}`, 
    //                      callback: function(reply, convo) { 
    //                        console.log(reply); 
    //                        convo.say('branch has been made on the repo ' + repos.values[i].slug); 
    //                        convo.next(); 
    //                      } 
    //                    }

    //                    actions.push(action);
    //                    callbacks.push(callback);
    //                  }
    //                  var callback = { 
    //                    default: true, 
    //                    callback: function(reply, convo) { 
    //                      console.log(reply); 
    //                      convo.say('cool stuff!');
    //                    } 
    //                  }
    //                  callbacks.push(callback);

    //                  let msg = {
    //                    text: "Issue has been assigned to you. Want to create a branch?",
    //                    attachments: [{
    //                      fallback: 'actions',
    //                      callback_id: "take_ticket_callback",
    //                      actions: actions
    //                    }]
    //                  };
    //                  bot.startConversation(message, function(err, convo) {
    //                    convo.ask(msg, callbacks);
    //                  });
    //                });
    //              }
    //            });
    //          }
    //        });
    //      }
    //    }
    //  }
    //  else {
    //    console.log(error);
    //  }
    //});
  });


}

module.exports = {
  feature: takeTicket
};
