// features/remind.js
function remind(bot, controller) {
  controller.hears(['remind ([0-9]+:[0-9]+:[0-9]+ .*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var time;
    var text;
    var realMessage;
    var messageArray;
    var hours = 0;
    var minutes = 0;
    var seconds = 0;
    var timeArray;
    var waitTime;
    messageArray = message.match[1].split(" ");
    time = messageArray[0];
    timeArray = time.split(":")
    hours = timeArray[0];
    minutes = timeArray[1];
    seconds = timeArray[2]
    text = messageArray.slice(1, messageArray.length);
    realMessage = text.join(" ");
    waitTime = hours * 60 * 60 * 1000 + minutes * 60 * 1000 + seconds * 1000;
    bot.reply(message, "Reminder set");
    bot.startPrivateConversation(message,function(err,dm) {
      setTimeout(function(){dm.say(realMessage);}, waitTime);
    });
  });
}

module.exports = {
    feature: remind
};
