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
var url = require('url');
var request = require('request')
var config = require('./package')

var redisURL = url.parse(process.env.REDISCLOUD_URL);
console.log(redisURL);

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
    token: process.env.token,
    incoming_webhook: {
      url: process.env.webhookurl
    }
})

// Install features
require('./features/about')(bot, controller);
require('./features/beerjar')(bot, controller);
require('./features/greet')(bot, controller);
require('./features/nickname')(bot, controller);
require('./features/saveit')(bot, controller);
require('./features/shutdown')(bot, controller);
require('./features/whoami')(bot, controller);

// Announce version to #libotrio-dev
bot.sendWebhook({
  text: 'Hello World! I am running Libotrio v' + config.version + '.',
  channel: '#libotrio-dev',
}, function(err, res) {
  console.log(err, res);
});

bot.startRTM();

