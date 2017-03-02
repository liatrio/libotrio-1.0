// Feature toggle config. Used to enable/disable individual features.

module.exports = {
  'about': true,
  'aws-billing': !!process.env.AWS_ACCESS_KEY_ID,
  'beerjar': true,
  'echo': true,
  'greet': true,
  'help': true,
  'jira': !!process.env.ATLASSIAN_USER,
  'nickname': true,
  'promote': !!process.env.JENKINS_API_KEY,
  'saveit': !!process.env.ATLASSIAN_USER,
  'shutdown': true,
  'whoami': true,
  'yt-search': !!process.env.GOOGLE_API_KEY,
  'ec2-list': !!process.env.AWS_ACCESS_KEY_ID,
};
