// Tells a random joke
function joke(bot, controller) {
  controller.hears(['joke'], 'direct_message,direct_mention,mention', function(bot, message) {
    var i = Math.random() * 11;
    setup(bot, message, parseInt(i));
    setTimeout(punchline, 2500, bot, message, parseInt(i));
  });
}

function setup(bot, message, i) {
  if (i == 0)
    bot.reply(message, 'What did the spider do on the computer?');
  if (i == 1)
    bot.reply(message, 'Why did the computer cross the road?');
  if (i == 2)
    bot.reply(message, 'What does a baby computer call his father?');
  if (i == 3)
    bot.reply(message, 'Why did the computer keep sneezing?');
  if (i == 4)
    bot.reply(message, 'What is a computer virus?');
  if (i == 5)
    bot.reply(message, 'Why was the computer cold?');
  if (i == 6)
    bot.reply(message, 'What do you get when you cross a computer and a lifeguard?');
  if (i == 7)
    bot.reply(message, 'Where do all the cool mice live?');
  if (i == 8)
    bot.reply(message, 'Why did the developer go broke?');
  if (i == 9)
    bot.reply(message, 'What do you call 8 hobbits?');
  if (i == 10)
    bot.reply(message, 'Why was the JavaScript developer sad?');
}

function punchline(bot, message, i) {
  if (i == 0)
    bot.reply(message, 'He made a website!');
  if (i == 1)
    bot.reply(message, 'To get a byte to eat!');
  if (i == 2)
    bot.reply(message, 'Data!');
  if (i == 3)
    bot.reply(message, 'It had a virus!');
  if (i == 4)
    bot.reply(message, 'A terminal illness!');
  if (i == 5)
    bot.reply(message, 'It left its Windows open!');
  if (i == 6)
    bot.reply(message, 'A screensaver!');
  if (i == 7)
    bot.reply(message, 'In their mousepads!');
  if (i == 8)
    bot.reply(message, 'Because he used up all his cache!');
  if (i == 9)
    bot.reply(message, 'A hobbyte!');
  if (i == 10)
    bot.reply(message, 'Because he didn\'t Node how to Express himself!');
}

function helpMessage(bot, controller) {
  return `Get a joke from Libotrio!
\`@${bot.identity.name} joke\``;
}

module.exports = {
  feature: joke,
  helpMessage,
};
