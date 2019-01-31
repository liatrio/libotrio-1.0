/*
 * birthday reminders
 *
 * Display basic information about Libotrio.
 *
*/

function birthdays(bot, controller) {
  controller.hears(['when is your birthday?'], 'direct_message,direct_mention,mention', function(bot, message) {
    bot.reply(message, "My first commit was July 19th, 2017!");
  });

  controller.hears(['^(my birthday is) (.*)'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {

    var bday = message.match[2];
    //console.log('1: ' + message.match[0] + '\n2: ' + message.match[1] + '\n3: ' + message.match[2] + '\n4: ' + message.match[3] + '\n');

    controller.storage.users.get(message.user, function(err, user) {
      if (!user) {
        var username = 'NotNamed';
        bot.api.users.info({user : message.user}, function(err, res){
          if (err) {
            bot.botkit.log('Failed to get the messages :(', err);
          }
          if (res && res.ok) {
            username = res.user.profile.display_name;
          }
        });
        console.log('Username has been found as ' + username);
        user = {
          id: message.user,
          name: username
        };
      }

      if(!user.birthday) {
        user.birthday = bday
        controller.storage.users.save(user, function(err, id) {
          bot.reply(message, 'Okay <@' + user.id + '>, your birthday has been set to ' + user.birthday + '! :birthday::tada:');
          //does not have a birthday set yet! Set one using the command, \"my birthday is <birthday>\"' );
        });
      }
      else {
        controller.storage.users.save(user, function(err, id) {
          bot.reply(message, 'Your birthday was already set to ' + user.birthday + ' :birthday:');
        });
      }
    });

  });

  controller.hears(['^(birthday) (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    //var amount = 1.00;
    var str = message.match[2];
    var sender_str = message.raw_message.user;
    var validUser = false;
    console.log(message)
    if (str.includes('@')) {
      str = str.replace('<@','');
      str = str.replace('>','');
      validUser = true;
    }
    if (sender_str.includes('@')) {
      sender_str = sender_str.replace('<@','');
      sender_str = sender_str.replace('>','');
    }
    if (validUser) {
      controller.storage.users.get(str, function(err, user) {
        if (!user) {
          bot.api.users.info({user: str}, function(err, response) {
            if (!response.user) {
              bot.reply(message, "That's not a Slack user.");
            }
            //user did not exist so create a new user object
            else {
              var name = response.user.profile.display_name;
              console.log('Username will be set as ' + name);
              user =
              {
                id: str,
                name: name,
                birthday: ""
              };
              //check if user called birthday on the bot iself
              if (user.name == '') {
                controller.storage.users.save(user, function(err, id)
                {
                  bot.reply(message, "My first commit was July 19th, 2017!");
                });
              }
              //case where user exists and birthday is already set
              else {
                if(!user.birthday) {
                  controller.storage.users.save(user, function(err, id)
                  {
                    bot.reply(message, '<@' + user.id + '> does not have a birthday set yet! Set one using the command, \"my birthday is <birthday>\"' );
                  });
                }
                else {
                  controller.storage.users.save(user, function(err, id)
                  {
                    bot.reply(message, ':birthday: <@' + user.id + '>\'s birthday is on ' + user.birthday + ':birthday:!');
                  });
                }
              }
            }
           })
         }
         else {
           if (user.name == '') {
            controller.storage.users.get(sender_str, function(err, user)
            {
              if (!user) {
                bot.api.users.info({user: sender_str}, function(err, response)
                {
                  if (!response.user) {
                    bot.reply(message, "Could not find slack user.");
                  }
                  else {
                    var sender_name = response.user.profile.display_name;
                    console.log('Sender name is ' + sender_name);
                    user =
                    {
                      id: sender_str,
                      name: sender_name
                    };
                    controller.storage.users.save(user, function(err, id) {
                      bot.reply(message, "My first commit was July 19th, 2017!");
                    });
                    }
                  });
                }
                else {
                  if(!user.birthday) {
                    controller.storage.users.save(user, function(err, id) {
                      bot.reply(message, '<@' + user.id + '> does not have a birthday set yet! Set one using the command, \"my birthday is <birthday>\"' );
                    });
                  }
                  else {
                    controller.storage.users.save(user, function(err, id) {
                      bot.reply(message, ':birthday: <@' + user.id + '>\'s birthday is on ' + user.birthday + ':birthday:!');
                    });
                  }
                }
              });
            }
            else {
              if(!user.birthday) {
                controller.storage.users.save(user, function(err, id) {
                  bot.reply(message, '<@' + user.id + '> does not have a birthday set yet! Set one using the command, \"my birthday is <birthday>\"' );
                });
              }
              else {
                controller.storage.users.save(user, function(err, id) {
                  bot.reply(message, ':birthday: <@' + user.id + '>\'s birthday is on ' + user.birthday + ':birthday:!');
                });
              }
            }
         }
      });
  }
  else {
    bot.reply(message, "Please use the *@* when asking for someone's birthday - Some people share the same name.");
  }
  });
}

function helpMessage(bot, controller) {
  return `Liatrio employee's birthdays
\`@${bot.identity.name} my birthday is @user\` - Sets the birthday for @user.
\`@${bot.identity.name} birthday @user\` - Shows the birthday for @user.`;
}

module.exports = {
  feature: birthdays,
  helpMessage,
};
