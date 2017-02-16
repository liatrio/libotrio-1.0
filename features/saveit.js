var Confluence = require("confluence-api");
const request = require('request');

const atlassianUser = process.env.ATLASSIAN_USER;
const atlassianPass = process.env.ATLASSIAN_PASS;

if (!atlassianUser || !atlassianPass) {
  console.error('ERR: The Confluence attachement save feature requires ATLASSIAN_USER and ATLASSIAN_PASS envars.');
  exit(1);
}

var config = {
    username: atlassianUser,
    password: atlassianPass,
    baseUrl:  "https://liatrio.atlassian.net/wiki"
    //version: 4 // Confluence major version, optional
};

var confluence = new Confluence(config);

module.exports = function(bot, controller) {
  controller.hears(['save to confluence', 'saveit', 'save it'], 'direct_message,direct_mention,mention', function(bot, message) {
    var found = false;
    var space = "LIATRIO"; //The Space key - required for the rest api.
    var page = "59122892";  //The Page id - required to host the attachments.  Get this by viewing the page information details.
    var channelApi = bot.api.channels.history;

    if (message.channel.startsWith("G"))
    {
      channelApi = bot.api.groups.history;
    }

      channelApi({
        channel: message.channel,
        count: 5
      }, function(err, res) {
        if (err) {
          bot.botkit.log('Failed to get the messages :', err);
        }
        if (res && res.ok) {
          bot.reply(message, 'Getting the last file within the past 5 messages');
          for (var resMessage in res.messages) {
            var obj = res.messages[resMessage];
            if (obj.subtype && obj.subtype == 'file_share') {
              found = true;
              bot.reply(message, 'Found a file named ' + obj.file.name);
              //Download the file with the bearer token
              var file = request.get(obj.file.url_private, {
                'auth': {
                  'bearer': process.env.SLACK_ACCESS_TOKEN
                }
              });

              bot.botkit.log(obj.file.url_private);

              confluence.createAttachment(space, page, file, function(err, data) {
                if (data.results !== undefined){
                  bot.reply(message, 'Uploaded ' + data.results[0].title);
                  bot.botkit.log(data.results[0].title);
                }
                else
                {
                  bot.botkit.log(err);
                  bot.reply(message, 'Upload failed: ' + err);
                }
              });
            }
            if (found) {
              bot.api.reactions.add({
                timestamp: message.ts,
                channel: message.channel,
                name: 'robot_face'
              }, function(err, res) {
                if (err) {
                  bot.botkit.log('Failed to add emoji reaction :', err);
                }
              });
              break;
            }
          }
        }
      });
    });
  };
