//
// feature for creating and deleting users for the bot
//

let ERROR_NEED_TAG='Cool! New member. Let\'s make sure to tag the user with the `@`.'

// verify added user is tagged, return cleaned up string
function check_for_tagged_name (dirty_id) {
  if (dirty_id.startsWith('<@')) {
    dirty_id = dirty_id.replace('<@','');
    dirty_id = dirty_id.replace('>','');
    console.log('new ID is: ' + dirty_id );
    return dirty_id;
  } else {
    return 0;
  }
}

function get_slack_id() {

}

function check_for_user() {

}

function add_new_user() {

}

function remove_user() {

}

function user(bot, controller) {
  controller.hears(['add user (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    
    var dirty_id = message.match[1];
    if(!check_for_tagged_name(dirty_id)) {
      bot.replyInThread(message, ERROR_NEED_TAG);
      return;
    }

    var new_user = get_slack_id(dirty_id);

    if(!check_for_user()) {
      add_new_user();
    } else {

    }
    bot.replyInThread(message, 'This is successful');
  });
}

function helpMessage(bot, controller) {
  return `Initialize or remove users from the bot database`;
}

module.exports = {
  feature: user,
  helpMessage,
};