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
}

function getTicketsForBoard(bot, message, boardId) {

    console.log(`** inside getTicketsForBoard`);
    console.log(`** message: \n${JSON.stringify(message, null, 2)}`);
    let statusFilter = message.original_message.attachments[0].fields[0].value || message.attachments[0].fields[0].value || 'to do'; //todo: this needs refinement
    bot.reply(message, `statusFilter: ${statusFilter}`);

    let opts = {
        boardId: boardId,
        maxResults: "9999",
        fields: ["status", "summary"],
        jql: "status in ('" + statusFilter + "')"
    };

    let output = `Ticket list for ${boardId}`;
    let ticketAttachments = [];

    return jiraClient.board.getIssuesForBoard(opts)
        .then((error, issues) => {
            if (error) {
                output = `There was an error: \`\`\`${JSON.stringify(error)}\`\`\``;
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
            return Promise.resolve("dummy val")
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
                console.log(`Response from selectBoard: ${JSON.stringify(response, null, 2)}`);
                return getTicketsForBoard(bot, message, response);
            }, rejection => {
                console.log(`Rejection: ${JSON.stringify(rejection, null, 2)}`);
                if (rejection.attachments) {
                    rejection.attachments[0].fields = [{
                        title: 'statusFilter',
                        value: status,
                        short: true
                    }];
                }
                bot.reply(message, rejection);
            });

    });

    controller.hears(['get ([a-zA-Z -_]*)tickets'], ['direct_message', 'mention', 'direct_mention'], function (bot, message) {
        bot.reply(message, `You need to specify a board. Try \`get ${message.match[1]}tickets for [board]\``);
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

function selectBoard(id) {
    if (!isNaN(id)) {
        return Promise.resolve(id);
    } else {

        let getBoard = (boards, error) => {
            if (!error) {
                if (boards.values.length > 1) {
                    console.log(`** Found ${boards.values.length} boards; prompting user for input`);
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
                    console.log(`** One board found, getting tickets for board ID ${boards.values[0].id}`);
                    return Promise.resolve(boards.values[0].id)
                }
            } else {
                console.log("** Found error from API: " + JSON.stringify(error, null, 2));
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

