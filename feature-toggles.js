// Feature toggle config. Used to enable/disable individual features.

module.exports = {
  'about': true,
  'beerjar': true,
  'echo': true,
  'greet': true,
  'help': true,
  'nickname': true,
  'promote': !!process.env.JENKINS_API_KEY,
  'saveit': true,
  'shutdown': true,
  'whoami': true,
};

