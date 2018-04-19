const os = require('os');

let config = require('../package');

let getUptime = () => {
  let delim = ' ';
  let totalSeconds = Math.floor(process.uptime());
  let hours = Math.floor( (totalSeconds * 3600) % 60);
  let minutes = Math.floor( (totalSeconds * 60) % 60);
  let seconds = Math.floor(totalSeconds % 60);
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;
  return hours + 'h'+ delim + minutes + 'm' + delim + seconds + 's';
};

let about = (bot, controller)  => {
  controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name', 'about'],
  'direct_message,direct_mention,mention', function(bot, message) {
    let version = config.version;
    let hostname = os.hostname();
    let platform = os.platform();
    let uptime = getUptime();
    bot.reply(message, `I am Libotrio v.${config.version} running for the past ${uptime}. :robot_face: :liatrio:\n ( Hostname: ${hostname}, Platform: ${platform} )`);
  });
}

let helpMessage = (bot, controller) => {
  return `\nDisplay basic information about Libotrio.\n
\`@${bot.identity.name} about\`\n`;
}

module.exports = {
  feature: about,
  helpMessage,
};

