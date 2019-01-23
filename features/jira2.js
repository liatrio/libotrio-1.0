// Matches Jira tickets in messages and links to the jira ticket.

var JiraClient = require('jira-connector');


const atlassianUser = process.env.ATLASSIAN_USER;
const atlassianPass = process.env.ATLASSIAN_PASS;


if (!atlassianUser || !atlassianPass) {
    console.error('ERR: Jira feature requires ATLASSIAN_USER and ATLASSIAN_PASS env vars.');
    exit(1);
}

var jira = new JiraClient({
    host: 'liatrio.atlassian.net',
    basic_auth: {
        username: atlassianUser,
        password: atlassianPass
    }
});

function handleButtons(bot, message){
    bot.replyInteractive(message, {
        text: '...',
        attachments: [
            {
                title: 'My buttons',
                callback_id: '123',
                attachment_type: 'default',
                actions: [
                    {
                        "name": "yes",
                        "text": "Yes!",
                        "value": "yes",
                        "type": "button",
                    },
                    {
                        "text": "No!",
                        "name": "no",
                        "value": "delete",
                        "style": "danger",
                        "type": "button",
                        "confirm": {
                            "title": "Are you sure?",
                            "text": "This will do something!",
                            "ok_text": "Yes",
                            "dismiss_text": "No"
                        }
                    }
                ]
            }
        ]
    });
}

function handleBoard(bot, message){
    bot.replyInteractive(message, {
        text: `Board selected: ${message.value}`,
        attachments: []
    });
}

function jira2(bot, controller) {
    controller.hears(['get tickets for ([a-zA-Z]*[a-zA-Z0-9_]*)'], ['direct_message', 'mention', 'direct_mention', 'ambient'], function (bot, message) {
        if (typeof message.match[1] === 'undefined' || message.match[1] === null) {
            bot.reply(message, "Please specify which board you want to pull tickets from.");
            return;
        }

        let boardName = message.match[1];

        console.log("Checking for a board matching \`" + boardName + "\`");

        let getBoard = id => {
            if (!isNaN(id)) {
                return Promise.resolve(Number(id));
            } else {
                return jira.board.getAllBoards({name: id})
                    .then((boards, error) => {
                        console.log(`result: ${JSON.stringify(boards, null, 2)}`);
                        if (typeof error === 'undefined') {
                            console.log("Doesn't appear to be any errors from the API...");
                            console.log(`Size of boards array: ${boards.values.length}`);
                            if (boards.values.length > 1) {
                                console.log("Multiple boards found, building error message...");

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
                                console.log(`One board found, returning ID '${boards.values[0].id}'`);
                                return Promise.resolve(boards.values[0].id);
                            }
                        } else {
                            console.log("Found error from API: " + JSON.stringify(error, null, 2));
                            return Promise.reject(error);
                        }
                    });
            }
        };

        getBoard(boardName)
            .then(response => {
                console.log(`Response: ${JSON.stringify(response, null, 2)}`);
                bot.reply(message, String(response));
                return response;
            }, rejection => {
                console.log(`Rejection: ${JSON.stringify(rejection, null, 2)}`);
                bot.reply(message, rejection);
            });


    });

    controller.hears('interactive', 'direct_message', function (bot, message) {

        bot.reply(message, {
            attachments: [
                {
                    title: 'Do you want to interact with my buttons?',
                    callback_id: 'buttons',
                    attachment_type: 'default',
                    actions: [
                        {
                            "name": "yes",
                            "text": "Yes",
                            "value": "yes",
                            "type": "button",
                        },
                        {
                            "name": "no",
                            "text": "No",
                            "value": "no",
                            "type": "button",
                        }
                    ]
                }
            ]
        });
    });

    // receive an interactive message, and reply with a message that will replace the original
    controller.on('interactive_message_callback', function (bot, message) {

        // check message.actions and message.callback_id to see what action to take...
        console.log(JSON.stringify(message, null, 2));

        if(message.callback_id === 'buttons') {
            handleButtons(bot, message);
        }

        if(message.callback_id === 'board_select'){
            handleBoard(bot, message);
        }


    });
}

function helpMessage(bot, controller) {
    return "todo";
}

module.exports = {
    feature: jira2,
    helpMessage,
};

