// Matches Jira tickets in messages and links to the jira ticket.

const JiraClient = require('jira-connector');


const atlassianUser = process.env.ATLASSIAN_USER;
const atlassianPass = process.env.ATLASSIAN_PASS;


if (!atlassianUser || !atlassianPass) {
    console.error('ERR: Jira feature requires ATLASSIAN_USER and ATLASSIAN_PASS env vars.');
    exit(1);
}

const jiraHost = process.env.JIRA_HOST || 'liatrio.atlassian.net';

const jiraClient = new JiraClient({
    host: jiraHost,
    basic_auth: {
        username: atlassianUser,
        password: atlassianPass
    }
});

function handleBoard(bot, message) {
    let board = message.actions[0].selected_options[0].value;
    if (board) {
        getTicketsForBoard(bot, message, board);
    } else {
        bot.reply(message, "board not provided; check logs");
    }
    // bot.replyInteractive(message, {
    //     text: `Board selected: ${message.actions[0].selected_options[0].value}`,
    //     attachments: []
    // });


}

function getTicketsForBoard(bot, message, boardId) {

    let statusFilter = message.original_message.attachments[0].fields[0].value || "*";
    bot.reply(message, `statusFilter: ${statusFilter}`);

    let opts = {
        boardId: boardId,
        maxResults: "9999",
        fields: ["status", "summary"],
        jql: "status in ('" + statusFilter + "')"
    };

    let output = `Ticket list for ${boardId}`;
    let ticketAttachments = [];

    jiraClient.board.getIssuesForBoard(opts, function (error, issues) {
        if (error) {
            output = "There was an error: " + error;
        } else {
            for (let i = 0; i < issues.issues.length; i++) {
                let newTicket = {
                    t_key: issues.issues[i].key,
                    t_summary: issues.issues[i].fields.summary,
                    t_status: issues.issues[i].fields.status.name,
                    t_link: `https://${jiraHost}/secure/RapidBoard.jspa?rapidView=${boardId}&modal=detail&selectedIssue=${issues.issues[i].key}`
                };
                let ticketAttachment = {
                    text: `<${newTicket.t_link}|${newTicket.t_key}>:${newTicket.t_summary} - *${newTicket.t_status}*`
                };
                ticketAttachments.push(ticketAttachment);
            }
        }
        bot.reply(message, {text: output, attachments: ticketAttachments});
    })
        .catch(rejection => {
            console.log(JSON.stringify(rejection));
        });

}

function jira(bot, controller) {

    controller.hears(['get ([a-zA-Z -_]*)tickets for ([a-zA-Z0-9_]*)'], ['direct_message', 'mention', 'direct_mention'], function (bot, message) {

        let status = message.match[1].trim();
        let board = message.match[2].trim();

        if (!board) {
            bot.reply(message, "Please specify which board you want to pull tickets from.");
            return;
        }

        console.log("Checking for a board matching \`" + board + "\`");

        selectBoard(board)
            .then(response => {
                console.log(`Response: ${JSON.stringify(response, null, 2)}`);
                bot.reply(message, String(response));
                return response;
            }, rejection => {
                console.log(`******* BEFORE MODIFICATION *******\n${JSON.stringify(rejection, null, 2)}\n******* /BEFORE MODIFICATION *******`);
                rejection.attachments[0].fields = [{
                    title: 'statusFilter',
                    value: status,
                    short: true
                }];
                console.log(`******* BEFORE SENDING *******\n${JSON.stringify(rejection, null, 2)}\n******* /BEFORE SENDING *******`);
                console.log(`Rejection: ${JSON.stringify(rejection, null, 2)}`);
                bot.reply(message, rejection);
            });

    });

    controller.hears(['get ([a-zA-Z -_]*)tickets'], ['direct_message', 'mention', 'direct_mention'], function (bot, message) {
        bot.reply(message, `You need to specify a board. Try \`get ${message.match[1]}tickets for [board]\``);
    });

    controller.hears(['convo'], ['direct_message', 'mention', 'direct_mention'], function (bot, message) {
        bot.startConversation(message, function (err, convo) {

            convo.ask({
                attachments: [
                    {
                        title: 'Do you want to proceed?',
                        callback_id: '123',
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
            }, [
                {
                    pattern: "yes",
                    callback: function (reply, convo) {
                        convo.say('FABULOUS!');
                        convo.next();
                        // do something awesome here.
                    }
                },
                {
                    pattern: "no",
                    callback: function (reply, convo) {
                        convo.say('Too bad');
                        convo.next();
                    }
                },
                {
                    default: true,
                    callback: function (reply, convo) {
                        // do nothing
                    }
                }
            ]);
        });
    });

    // receive an interactive message, and reply with a message that will replace the original
    controller.on('interactive_message_callback', function (bot, message) {
        if (message.callback_id === 'board_select') {
            console.log(JSON.stringify(message, null, 2));
            handleBoard(bot, message);
        }
    });
}

function helpMessage(bot, controller) {
    return "todo";
}

function selectBoard(id) {
    if (!isNaN(id)) {
        return Promise.resolve(Number(id));
    } else {

        let getBoard = (boards, error) => {
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
        };

        return jiraClient.board.getAllBoards({name: id}).then(getBoard);
    }

}

module.exports = {
    feature: jira,
    helpMessage,
};

