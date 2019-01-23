// Matches Jira tickets in messages and links to the jira ticket.

const JiraClient = require('jira-connector');


const atlassianUser = process.env.ATLASSIAN_USER;
const atlassianPass = process.env.ATLASSIAN_PASS;


if (!atlassianUser || !atlassianPass) {
    console.error('ERR: Jira feature requires ATLASSIAN_USER and ATLASSIAN_PASS env vars.');
    exit(1);
}

const jiraClient = new JiraClient({
    host: 'liatrio.atlassian.net',
    basic_auth: {
        username: atlassianUser,
        password: atlassianPass
    }
});

function handleBoard(bot, message) {
    bot.replyInteractive(message, {
        text: `Board selected: ${message.actions[0].selected_options[0].value}`,
        attachments: []
    });
}

function selectBoard(id) {
    if (!isNaN(id)) {
        return Promise.resolve(Number(id));
    } else {
        return jiraClient.board.getAllBoards({name: id})
            .then((boards, error) => {
                console.log(`result: ${JSON.stringify(boards, null, 2)}`);
                if (typeof error === 'undefined') {
                    console.log(`Size of boards array: ${boards.values.length}`);
                    if (boards.values.length > 1) {
                        let reply_with_attachments = {
                            attachments: [{
                                text: 'Multiple boards found matching that name; please select one:',
                                callback_id: 'board_select',
                                actions: [
                                    {
                                        name: 'board_select',
                                        text: 'Please select one',
                                        type: 'select',
                                        options: []
                                    }
                                ]
                            }]
                        };

                        boards.values.forEach((board) => {
                            reply_with_attachments.attachments[0].actions[0].options.push({
                                text: board.name,
                                value: board.id
                            });
                        });

                        return Promise.reject(reply_with_attachments)
                    } else {
                        return Promise.resolve(boards.values[0].id);
                    }
                } else {
                    console.log("Found error from API: " + JSON.stringify(error, null, 2));
                    return Promise.reject(error);
                }
            });
    }

}

function jira(bot, controller) {
    controller.hears(['get tickets for ([a-zA-Z]*[a-zA-Z0-9_]*)'], ['direct_message', 'mention', 'direct_mention', 'ambient'], function (bot, message) {
        if (typeof message.match[1] === 'undefined' || message.match[1] === null) {
            bot.reply(message, "Please specify which board you want to pull tickets from.");
            return;
        }

        let boardName = message.match[1];

        console.log("Checking for a board matching \`" + boardName + "\`");

        selectBoard(boardName)
            .then(response => {
                console.log(`Response: ${JSON.stringify(response, null, 2)}`);
                bot.reply(message, String(response));
                return response;
            }, rejection => {
                console.log(`Rejection: ${JSON.stringify(rejection, null, 2)}`);
                bot.reply(message, rejection);
            });

    });

    // receive an interactive message, and reply with a message that will replace the original
    controller.on('interactive_message_callback', function (bot, message) {

        if (message.callback_id === 'board_select') {
            handleBoard(bot, message);
        }

    });
}

function helpMessage(bot, controller) {
    return "todo";
}

module.exports = {
    feature: jira,
    helpMessage,
};

