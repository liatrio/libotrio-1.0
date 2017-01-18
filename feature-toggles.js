// Feature toggle config. Used to enable/disable individual features.

module.exports = {
  'about': true,
  'beerjar': true,
  'echo': true,
  'greet': true,
  'help': true,
  'jira': !!process.env.JIRA_USER,
  'nickname': true,
  'promote': !!process.env.JENKINS_API_KEY,
  'saveit': !!process.env.JIRA_USER,
  'shutdown': true,
  'whoami': true,
};
