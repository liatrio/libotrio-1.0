//
// feature for creating and deleting users for the bot
//

let ERROR_NEED_TAG='Cool! New member. Let\'s make sure to tag the user with the `@`.'

// verify added user is tagged, return cleaned up string or false if id isn't correct
function check_and_clean_id (dirty_id) {
  if (dirty_id.startsWith('<@')) {
    dirty_id = dirty_id.replace('<@','');
    dirty_id = dirty_id.replace('>','');
    console.log('new ID is: ' + dirty_id );
    return dirty_id;
  } else {
    return false;
  }
}

// verify the user exists in the database, returns user if found
function check_for_user(controller, user_id) {
  return user = controller.storage.users.get(user_id, function(err, user) {});
}

// add user to database
function create_user_in_bot_db(bot, controller, new_user) {
  
  //get name
  bot.api.users.info({user: new_user}, function(err, response) {
    if (!response.user) {
      bot.replyInThread(message, 'That\'s not a Slack user.');
    } else {
      var name = response.user.profile.display_name;
      console.log('Username will be set as ' + name );
      user = {
        id: new_user,
        name: name,
        beerjar: 0
      };
      controller.storage.users.save(user, function(err, id) {});
    }
  });
}

// main user feature function
function user(bot, controller) {
  controller.hears(['add user (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    
    var dirty_id = message.match[1];
    var clean_id = check_and_clean_id(dirty_id);
    if(!clean_id) {
      bot.replyInThread(message, ERROR_NEED_TAG);
      return;
    } 
    
    let waiting_for_check = check_for_user(controller, clean_id);
    waiting_for_check.then(function(result) { 
      if(result) {
        bot.replyInThread(message, 'User already exists, have fun! :shaka:');
      } else {
        create_user_in_bot_db(bot, controller, clean_id);
        bot.reply(message, 'Congratulations and Welcome! :parrot:');
      }
    })
  });
}

function helpMessage(bot, controller) {
  return `Initialize or remove users from the bot database`;
}

module.exports = {
  feature: user,
  helpMessage,
};