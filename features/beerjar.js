function beerjar(bot, controller) {

  controller.hears(['beerjar help'], 'direct_message,direct_mention,mention', function(bot, message) {
    var text = '_beerjar_ commands are as follows: \n';
    text += '*beerjar bump @user* - Adds $1 to @user beerjar\n';
    text += '*beerjar me* - Adds $1 to your beerjar\n';
    text += '*beerjar balance* - Shows your beerjar balance\n';
    text += '*beerjar totals* - Shows running totals for every user\n';
    text += '*beerjar add* - Add any amount to your own beerjar\n';
    text += '*beerjar clear* - Empties your beerjar';
    bot.reply(message, text);
  });

  controller.hears(['beerjar bump (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var amount = 1.00;
    var str = message.match[1];
    str = str.replace('<@','');
    str = str.replace('>','');
    controller.storage.users.get(str, function(err, user) {
      if (!user) {
        console.log('Username will be set as nobody');
        user = {
          id: str,
          name: 'nobody'
        };
      }

      if (!user.beerjar){
        user.beerjar = amount;
      }
      else {
        user.beerjar = parseFloat(parseFloat(user.beerjar) + parseFloat(amount)).toFixed(2);
      }

      controller.storage.users.save(user, function(err, id) {
        bot.reply(message, 'Adding $' + amount + ' to the ' + user.name + ' beerjar.  Beerjar total for ' + user.name + ' = $' + user.beerjar);
      });
    });

  });

  controller.hears(['beerjar total'], 'direct_message,direct_mention,mention', function(bot, message) {
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

  controller.hears(['beerjar balance'], 'direct_message,direct_mention,mention', function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
      if (user) {
        bot.reply(message, 'Beerjar total for ' + user.name + ' = $' + parseFloat(user.beerjar).toFixed(2));
      }
      else {
        bot.reply(message, 'No user found for that ID yet.  Try \'beerjar me\' to create the user');
      }
    });
  });

  controller.hears(['beerjar clear'], 'direct_message,direct_mention,mention', function(bot, message) {
    controller.storage.users.get(message.user, function(err, user) {
      if (user) {
        user.beerjar = parseFloat(0).toFixed(2);
        controller.storage.users.save(user, function(err, id) {
          bot.reply(message, 'Beerjar total for ' + user.name + ' = $' + user.beerjar);
        });
      }
    });
  });

  controller.hears(['beerjar add (.*)', 'beerjar me'], 'direct_message,direct_mention,mention', function(bot, message) {
    var amount = parseFloat(message.match[1]).toFixed(2);
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
            username = res.user.name;
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
        bot.reply(message, 'Adding $'+ amount +' to the ' + user.name + ' beerjar.  Beerjar total for ' + user.name + ' = $' + user.beerjar);
      });

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
