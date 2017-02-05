// Feature toggle config. Used to enable/disable individual features.
//
// Features are installed in the order they are listed here
// (consider how this affects command-matching precedence)

module.exports = {
  'help': true,
  'about': true,
  'aws-billing': !!process.env.AWS_ACCESS_KEY_ID,
  'beerjar': true,
  'echo': true,
  'greet': true,
  'jira': !!process.env.JIRA_USER,
  'nickname': true,
  'promote': !!process.env.JENKINS_API_KEY,
  'saveit': !!process.env.JIRA_USER,
  'shutdown': true,
  'whoami': true,
};
