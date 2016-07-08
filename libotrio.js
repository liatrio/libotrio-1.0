/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node slack_bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var redis = require('./lib/storage/redis_storage');
var os = require('os');
var http = require('http');
var url = require('url');

var redisURL = url.parse(process.env.REDISCLOUD_URL);

var redisStorage = redis({
    namespace: 'libotrio',
    host: redisURL.hostname,
    port: redisURL.port,
    auth_pass: redisURL.auth.split(":")[1]
});

var controller = Botkit.slackbot({
    storage: redisStorage,
    debug: true
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();


controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face'
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

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
          bot.reply(message, 'Adding $'+ amount +' to the ' + user.name + ' beerjar.  Beerjar total for ' + user.name + ' = $' + user.beerjar);
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
  })
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
                username = res.user['name'];
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
})

controller.hears(['save it'], 'direct_message,direct_mention,mention', function(bot, message) {
    var libotrioFolder = 'https://script.google.com/a/macros/liatrio.com/s/AKfycbynHoy6cxazW1V78lNuOvG-Ex_SaAmJeQHlvSWZUUfsdwUrvpM/exec?url=';
    var found = false;

    if (message.channel.startsWith("G"))
    {
      bot.api.groups.history({
        channel: message.channel,
        count: 5
      }, function(err, res) {
          if (err) {
            bot.botkit.log('Failed to get the messages :(', err);
          }
          if (res && res.ok) {
            bot.reply(message, 'Getting the last image within the past 5 messages');
            for (var resMessage in res.messages) {
              var obj = res.messages[resMessage];
              if (obj.subtype && obj.subtype == 'file_share') {
                found = true;
                bot.reply(message, 'Found a file named ' + obj.file.name + '. Click this link to send ' + obj.file.name + ' to google drive: ' + libotrioFolder + obj.file.url_private);
                }
              if (found) {
                bot.api.reactions.add({
                        timestamp: message.ts,
                        channel: message.channel,
                        name: 'robot_face'
                    }, function(err, res) {
                        if (err) {
                            bot.botkit.log('Failed to add emoji reaction :(', err);
                       }
                });
                break;
              }
            }
         }
      });
    }
    else
    {
      bot.api.channels.history({
        channel: message.channel,
        count: 5
      }, function(err, res) {
          if (err) {
            bot.botkit.log('Failed to get the messages :(', err);
          }
          if (res && res.ok) {
            bot.reply(message, 'Getting the last image within the past 5 messages');
            for (var resMessage in res.messages) {
              var obj = res.messages[resMessage];
              if (obj.subtype && obj.subtype == 'file_share') {
                found = true;
                bot.reply(message, 'Found a file named ' + obj.file.name + 'Click this link to send ' + obj.file.name + ' to google drive: ' + libotrioFolder + obj.file.url_private);
                }
              if (found) {
                bot.api.reactions.add({
                        timestamp: message.ts,
                        channel: message.channel,
                        name: 'robot_face'
                    }, function(err, res) {
                        if (err) {
                            bot.botkit.log('Failed to add emoji reaction :(', err);
                       }
                });
                break;
              }
            }
         }
      });
    }
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});


controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}
