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
  Say: "who am I?"
  The bot will tell you your name, if it knows one for you.
  Say: "shutdown"
  The bot will ask if you are sure, and then shut itself down.
  Make sure to invite your bot into other channels using /invite @<my bot>!
# EXTEND THE BOT:
  Botkit has many features for building cool and useful bots!
  Read all about it here:
    -> http://howdy.ai/botkit
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

const botkit = require('botkit');
const mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGODB_URI});
const featureToggles = require('./feature-toggles');

if (!process.env.SLACK_ACCESS_TOKEN) {
    console.log('Error: Specify SLACK_ACCESS_TOKEN in environment');
    process.exit(1);
}

if (!process.env.MONGODB_URI) {
    console.log('Error: Specify MONGODB_URI in environment');
    process.exit(1);
}

const controller = botkit.slackbot({
    clientSigningSecret: process.env.SLACK_VERIFICATION_TOKEN,
    storage: mongoStorage,
    debug: false
});


const bot = controller.spawn({
    token: process.env.SLACK_ACCESS_TOKEN,
    incoming_webhook: {
        url: process.env.SLACK_WEBHOOK_URL
    }
});

// used for slack apps, and communication from slack back to the bot via a webhook
// requires slack SLACK_CLIENTID, SLACK_CLIENTSECRET, and PORT to be set via environment variables
if (process.env.SLACK_CLIENTID && process.env.SLACK_CLIENTSECRET && process.env.PORT){
  controller.configureSlackApp({
      clientId: process.env.SLACK_CLIENTID,
      clientSecret: process.env.SLACK_CLIENTSECRET,
      scopes: ['bot']
  });

  controller.setupWebserver(process.env.PORT, function (err, webserver) {
      controller.createWebhookEndpoints(controller.webserver);

      controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
          if (err) {
              res.status(500).send('ERROR: '+ err);
          } else {
              res.send('Success!');
          }
      });
  });
}

// enable features defined in feature toggle
for (var feature in featureToggles) {
    if (featureToggles[feature]) {
        require(`${__dirname}/features/${feature}`).feature(bot, controller);
    }
}

bot.startRTM();
