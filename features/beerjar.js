function beerjar(bot, controller) {

  controller.hears(['beerjar help'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
    var text = '_beerjar_ commands are as follows: \n';
    text += '*beerjar @user* - Adds $1 to @user beerjar\n';
    text += '*beerjar me or beerjar me $amt* - Adds $ amount to your own beerjar\n';
    text += '*beerjar balance* - Shows your beerjar balance\n';
    text += '*beerjar totals* - Shows running totals for every user\n';
    text += '*beerjar clear* - Empties your beerjar';
    bot.reply(message, text);
  });

  controller.hears(['^(beerjar total)'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
    controller.storage.users.all(function(err, users) {
      var userList = '';
      if (users)
      {
        for (var obj in users)
        {
          var user = users[obj];
          userList = userList + user.name + ' :beers: $' + user.beerjar + '\n';
        }
        bot.reply(message, '*Beerjar Totals:* \n' + userList);
      }
    });
  });

  controller.hears(['^(beerjar balance)'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
      if (user) {
        bot.reply(message, 'Beerjar total for ' + user.name + ' = $' + parseFloat(user.beerjar).toFixed(2));
      }
      else {
        bot.reply(message, 'No user found for that ID yet.  Try \'beerjar me\' to create the user');
      }
    });
  });

  controller.hears(['^(beerjar me) (.*)', '^(beerjar me)'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
    var amount = parseFloat(message.match[2]).toFixed(2);
    console.log(amount);
    if (amount < 0){
      amount = 0.00;
    }
    if (isNaN(amount)){
      amount = parseFloat('1.00');
    }
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

      if (!user.beerjar){
        user.beerjar = amount;
      }
      else {
        user.beerjar = parseFloat(parseFloat(user.beerjar) + parseFloat(amount)).toFixed(2);
      }

      console.log('message user name =' + message.user);
      controller.storage.users.save(user, function(err, id) {
        bot.reply(message, ':beers: Adding $' + amount + ' to the <@' + user.id + '> beerjar.  Beerjar total for <@' + user.id + '> = $' + user.beerjar);
      });

    });

  });

  controller.hears(['^(beerjar) (.*)'], 'direct_message,direct_mention,mention,ambient', function(bot, message) {
    var amount = 1.00;
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
    if (validUser)
    {
      controller.storage.users.get(str, function(err, user)
      {
        if (!user)
        {
          bot.api.users.info({user: str}, function(err, response)
          {
            if (!response.user)
            {
              bot.reply(message, "That's not a Slack user.");
            }
            else
            {
              var name = response.user.profile.display_name;
              console.log('Username will be set as ' + name);
              user =
              {
                id: str,
                name: name,
                beerjar: 0
              };
              if (user.name == '')
              {
                controller.storage.users.save(user, function(err, id)
                {
                  bot.reply(message, ":laughing_eyes_open: Beerjarring a bot is a bad idea, dare try again. :laughing_eyes_open:");
                });
              }
              else
              {
                user.beerjar = amount;
                controller.storage.users.save(user, function(err, id)
                {
                  bot.reply(message, ':beers: :smiley: Adding $' + amount + ' to the <@' + user.id + '> beerjar.  Beerjar total for <@' + user.id + '> = $' + user.beerjar);
                });
              }
            }
           })
         }
         else
         {
           if (user.name == '')
           {
            controller.storage.users.get(sender_str, function(err, user)
            {
              var sassyResponse = [
                ":beers: Silly <@" + user.id + "> I am far too superior to be beerjarred :neckbeard:. Adding $100 to <@" + user.id + ">'s beerjar. New total $" + user.beerjar,
                ":beers: Interesting <@" + user.id + ">, I see you'd rather have a keg than a six-pack. Adding $100 to <@" + user.id + ">'s beerjar. New total $" + user.beerjar,
                ":beers: :no_entry_sign: *403 Error* :no_entry_sign: Why don't you test your luck and try again :wink: Adding $100 to <@" + user.id + ">'s beerjar. New total $" + user.beerjar,
                ":beers: :partyparrot: WOOHOO :beers: on <@" + user.id + "> Adding $100 to <@" + user.id + ">'s beerjar. New total $" + user.beerjar,
                ":beers: <@" + user.id + "> You have your entire life to be a jerk. Why not take today off? Adding $100 to <@" + user.id + ">'s beerjar. New total $" + user.beerjar
               ];
              if (!user)
              {
                bot.api.users.info({user: sender_str}, function(err, response)
                {
                  if (!response.user)
                  {
                    bot.reply(message, "Could not find slack user.");
                  }
                  else
                  {
                    var sender_name = response.user.profile.display_name;
                    console.log('Sender name is ' + sender_name);
                    user =
                    {
                      id: sender_str,
                      name: sender_name
                    };
                    user.beerjar = 100;
                    controller.storage.users.save(user, function(err,id)
                    {
                      bot.reply(message, sassyResponse[Math.floor(Math.random() * sassyResponse.length)]);
                    });
                    }
                  });
                }
                else
                {
                  if (!user.beerjar)
                  {
                    user.beerjar = amount;
                  }
                  else
                  {
                    user.beerjar = parseFloat(parseFloat(user.beerjar) + parseFloat(100)).toFixed(2);
                  }
                  controller.storage.users.save(user, function(err, id) {
                    bot.reply(message, sassyResponse[Math.floor(Math.random() * sassyResponse.length)]);
                  });
                }
              });
            }
            else
            {
              if (!user.beerjar)
              {
                user.beerjar = amount;
              }
              else
              {
                user.beerjar = parseFloat(parseFloat(user.beerjar) + parseFloat(amount)).toFixed(2);
              }
              controller.storage.users.save(user, function(err, id) {
                bot.reply(message, ':beers: Adding $' + amount + ' to the <@' + user.id + '> beerjar.  Beerjar total for <@' + user.id + '> = $' + user.beerjar);
              });
            }
          }
      });
  }
  else
  {
    bot.reply(message, "Please use the *@* when beerjarring someone - Some people share the same name.");
  }
});

  controller.hears(['beerjar clear'], 'direct_message,direct_mention,mention', function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
      if (user) {
        user.beerjar = parseFloat(0).toFixed(2);
        controller.storage.users.save(user, function(err, id) {
          bot.reply(message, 'Beerjar total for <@' + user.name + '> = $' + user.beerjar);
        });
      }
    });
  });
}

function helpMessage(bot, controller) {
  return `Liatrio company beerjar.
\`@${bot.identity.name} beerjar bump @user\` - Adds $1 to @user beerjar.
\`@${bot.identity.name} beerjar me\` - Adds $1 to your beerjar.
\`@${bot.identity.name} beerjar balance\` - Shows your beerjar balance.
\`@${bot.identity.name} beerjar totals\` - Shows running totals for every user.
\`@${bot.identity.name} beerjar add\` - Add any amount to your own beerjar.
\`@${bot.identity.name} beerjar clear\` - Empties your beerjar.`;
}

module.exports = {
  feature: beerjar,
  helpMessage,
};
