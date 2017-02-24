// Youtube search feature - returns url of top result of a youtube query

// Import youtube api v3
const youtube = require('googleapis').youtube('v3');

if (!process.env.GOOGLE_API_KEY) {
  console.error('yt-search feature required a GOOGLE_API_KEY environment variables');
  process.exit(1);
}

module.exports = function(bot, controller) {
  controller.hears(['yt (.*)'], ['direct_message', 'mention', 'direction_mention', 'ambient'], function(bot, message) {
    let params = {
      auth: process.env.GOOGLE_API_KEY,
      safeSearch: 'moderate', // No naughty stuff ;) 
      type: 'video',
      part: ['id'],
      q: message.match[1],
    };
    youtube.search.list(params, [], (err, response) => {
      if (err) {
        console.error(err);
        bot.reply(message, 'Error making request to youtube api.');
      } else if (response.items.length === 0) {
        bot.reply(message, 'No results found');
      } else {
        bot.reply(message, `https://www.youtube.com/watch?v=${response.items[0].id.videoId}`);
      }
    });
  });
};

