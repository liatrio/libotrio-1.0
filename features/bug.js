// report a bug to the chatops team

function jiraCreate(summary, creator) {
  console.log(summary + ' by ' + creator);
};

function bug(bot, controller) {
  var summary;
  var creator;

  controller.hears(['bug (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    summary = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
      if (!user) {
        var username;
        bot.api.users.info({user : message.user}, function(err, res){
          if (err) {
            bot.botkit.log('Failed to get the messages :(', err);
          } else if (res && res.ok) {
            username = res.user.profile.display_name;
            console.log('Username has been found as ' + username);
            user = {
              id: message.user,
              name: username
            };
          }
        });
      }
      creator = user.name;
    });
    
    bot.replyInThread(message, 'Thanks, ' + creator + '.\n The ticket summary will be stored as \n_' + summary + '_');
    jiraCreate(summary, creator);

	});
};

function helpMessage(bot, controller) {
  return `Under construction. This feature will let you tell the libotrio team that there is a problem.`;
}

module.exports = {
  feature: bug,
  helpMessage,
};
