// Matches Jira tickets in messages and links to the jira ticket.

const request = require('request');
const async = require('async');

const jiraApiUrl = 'https://liatrio.atlassian.net/rest/api/2';
const atlassianUser = process.env.ATLASSIAN_USER;
const atlassianPass = process.env.ATLASSIAN_PASS;

if (!atlassianUser || !atlassianPass) {
  console.error('ERR: Jira feature requires ATLASSIAN_USER and ATLASSIAN_PASS envars.');
  exit(1);
}

// Queries the Jira REST api with with the given endpoint, method, and body.
// Invokes cb function on completion with `error`, `response`, and `body`
// parameters.
function queryJira({method, endpoint, body}, cb) {
  return request({
    url: jiraApiUrl + endpoint,
    method: method,
    body: body,
    json: true,
    auth: {
      user: atlassianUser,
      pass: atlassianPass,
    },
  }, cb);
}

// Retrieves an issue form the Jira REST api.
// Invokes cb function on completion with `error` and `body` parameters.
function getIssue(key, cb) {
  let options = {
    method: 'GET',
    endpoint: '/issue/' + key,
  };
  queryJira(options, (error, response, body) => {
    cb(error, body);
  });
}

// Builds a slack message attachment for the given issue
// (returned form `getIssue`).
function buildIssueAttachment(issue) {
  let ticketLink = `https://liatrio.atlassian.net/browse/${issue.key}`;
  let created = new Date(issue.fields.created);
  let formattedCreated = `${created.getMonth()+1}/${created.getDate()}/${created.getFullYear()}`;

  issue.fields.summary = issue.fields.summary || 'N/A'
  issue.fields.status = issue.fields.status || 'N/A'
  issue.fields.reporter = issue.fields.reporter || { name: 'N/A' }
  issue.fields.assignee = issue.fields.assignee || { name: 'N/A' }

  return {
    color: '#36a64f',
    title: issue.key,
    title_link: ticketLink,
    fallback: `${issue.key}: ${issue.fields.summary} (${ticketLink})`,
    fields: [
      {
        title: 'Summary',
        value: issue.fields.summary,
      },
      {
        title: 'Status',
        value: issue.fields.status.name,
        short: true,
      },
      {
        title: 'Created',
        value: formattedCreated,
        short: true,
      },
      {
        title: 'Reporter',
        value: issue.fields.reporter.name,
        short: true,
      },
      {
        title: 'Assignee',
        value: issue.fields.assignee.name,
        short: true,
      },
    ],
  };
}

function jira(bot, controller) {
  if (!(atlassianUser && atlassianPass)) { 
    console.error('ERR: Jira feature requires ATLASSIAN_USER and ATLASSIAN_PASS envars.');
    return;
  }

  controller.hears(['([a-zA-Z]+-[0-9]+)'], ['direct_message', 'mention', 'direct_mention', 'ambient'], function(bot, message) {
    let ticketKeys = message.text.match(/([A-Z]+-[0-9]+)/gi).map((m) => m.toUpperCase());
    async.map(ticketKeys, getIssue, (error, issues) => {
      if (error) {
        console.error(error);
        return;
      }
      let matchedIssues = issues.filter((issue) => !('errorMessages' in issue));
      let attachments = matchedIssues.map(buildIssueAttachment);
      if (attachments) {
        bot.reply(message, {attachments});
      }
    });
  });
}

function helpMessage(bot, controller) {
  return `Look up and display Jira ticket details.
Include a ticket key (such as \`LIB-3\`) in your slack message.`;
}

module.exports = {
  feature: jira,
  helpMessage,
};

