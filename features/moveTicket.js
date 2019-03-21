const request = require('request');
const JiraClient = require('jira-connector');
const jira = new JiraClient( {
  host: process.env.JIRA_HOST,
  protocol: process.env.JIRA_PROTOCOL,
  basic_auth: {
    username: process.env.ATLASSIAN_USER,
    password: process.env.ATLASSIAN_PASS
  }
});

var slackCallback = function(reply, convo, is, message) { 
  if (reply.text == 'None'){
      convo.say("Ok, no branch will be made. :thumbsup:"); 
      convo.next(); 
  }
  else {
    const key = message.match[1];
    var bitbucketUrl = "https://" + process.env.ATLASSIAN_USER + ":" + process.env.ATLASSIAN_PASS + "@" + process.env.BITBUCKET_HOST + "/rest/branch-utils/1.0/"
    var branch = key + "-" + is.fields.description.replace(/ /g, "-");
    var postData = {
      name: branch,
      startPoint: "refs/heads/master"
    }
    request({
      url: bitbucketUrl + "projects/" +  key.split("-")[0] + "/repos/" + reply.text + "/branches", 
      headers: { 'X-Atlassian-Token': 'no-check' }, json: true,
      method: 'post', body: postData}, function(err, res, bod) {
        if (err) { console.log(err); }
        else { 
          var link = "https://" + process.env.BITBUCKET_HOST + "/projects/" + key.split("-")[0] + "/repos/" + "pipeline-demo-application" + "/browse"
          convo.say(`branch has been made on the repo <${link}|${reply.text}>` + " with the branch name `" + branch + "`"); 
          convo.next(); 
        }
    });
  }
}

var getIssue = function(is, bot, message) {
  var actions = [];
  var callbacks = [];
  var bitbucketUrl = "https://" + process.env.ATLASSIAN_USER + ":" + process.env.ATLASSIAN_PASS + "@" + process.env.BITBUCKET_HOST + "/rest/api/1.0/"
  request({url: bitbucketUrl + `projects/${is.fields.project.key}/repos`}, function(err, res, bod) {
    var repos = JSON.parse(bod);

    for (var i = 0; i < repos.values.length; i++){
      var action = { type: "button", name: `${repos.values[i].slug}`, text: `${repos.values[i].slug}`, value: `${repos.values[i].slug}` }
      var callback = { 
        pattern: `${repos.values[i].slug}`, 
        callback: function(reply, convo) {
          slackCallback(reply, convo, is, message);
        }
      }

      actions.push(action);
      callbacks.push(callback);
    }
    var action = { type: "button", name: "None", text: "No new branch", value: "None" }
    var callback = { 
      default: true, 
      pattern: "None", 
      callback: function(reply, convo) {
        slackCallback(reply, convo, is, message);
      }
    }
    actions.push(action);
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


var getTransitions = function(transitions, bot, message) {
  console.log(transitions);

  const args = message.raw_message.text.toLowerCase();

  let key = args.split(" ")[2];
  var transition = "";
  var transitionId;

  // if (args.includes("in progress"))
  //   transition = "In Progress";
  // else if (args.includes("done"))
  //   transition = "Done";
  // else if (args.includes("to do"))
  //   transition = "To Do";
  // else if (args.includes("backlog"))
  //   transition = "Backlog";
  // else if (args.includes("selected for development"))
  //   transition = "Selected for Development";
  //

  for (var j = 0; j < transitions.transitions.length; j++){
    if (args.includes(transitions.transitions[j].to.name.toLowerCase())){
      transition = transitions.transitions[j].to.name
      transitionId = transitions.transitions[j].id
    }
  }

  var transitionPayload = { update: { comment: [{ add: { body: "This ticket was transitioned via a Slack command." } }] },
    fields: {}, transition: { id: `${transitionId}`}
  };
  jira.issue.transitionIssue({ issueKey: key, transition: transitionPayload}, function(error, issue) {
    if (error){
      bot.reply(message, 'Failed to transition ticket.');
      console.log(error);
    }
    else {
      bot.reply(message, `Issue has been moved to \`${transition}\``);
    }
  });
}

var getUserlist = function(error, response, body, bot, message) {
  if (!error && response.statusCode == 200) {
    const key = message.match[1];
    const list = JSON.parse(body);
    for (var i = 0; i < list.members.length; i++){
      if (list.members[i].id == message.user){
        const user = list.members[i].profile.email.split("@")[0];
        jira.issue.getTransitions({ issueKey: key}, function(error, transitions){
          if (error) {
            bot.reply(message, 'Oops! That didn\'t work. Are you sure thats a ticket? :thinking_face:');
            console.log(error);
          }
          else {
            getTransitions(transitions, bot, message, user);
          }
        });
      }
    }
  }
  else {
    console.log(error);
  }
}

function moveTicket(bot, controller) {

  //controller.hears(['move ([a-zA-Z0-9_]*-[0-9]*)to ([a-zA-Z -_]*)'], 'direct_message,direct_mention,mention', function(bot, message) {
  controller.hears(['move (.*)to ([a-zA-Z -_]*)'], 'direct_message,direct_mention,mention', function(bot, message) {


    const args = message.raw_message.text;
    let key = args.split(" ")[2];

    jira.issue.getTransitions({ issueKey: key}, function(error, transitions){
      if (error) {
        bot.reply(message, 'Oops! That didn\'t work. Are you sure thats a ticket? :thinking_face:');
        console.log(error);
      }
      else {
        console.log(transitions.transitions);
        getTransitions(transitions, bot, message);
      }
    });
  });

}

module.exports = {
  feature: moveTicket
};

