module.exports = function(bot, controller) {

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

}

