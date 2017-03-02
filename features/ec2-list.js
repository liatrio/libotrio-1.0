// Queries liatrio ec2-console
//This feature will aim to provide a wrapper for a subset of the awscli api in a way that's
// easy to use through Slack. To start things off, the feature will allow Slack users to:
//List running ec2 instances
//Describe an instance



var AWS = require('aws-sdk');

var currentRegion = 'us-west-2';

AWS.config.update({
  region: currentRegion,
});

var ec2 = new AWS.EC2();

function getEc2Instances(cb) {

  let runningInstances = [];
  let stoppedInstances = [];

  ec2.describeInstances(function(err, result){
    if(err)
      console.log(err);
    for (var i = 0; i < result.Reservations.length; i++) {
      var res = result.Reservations[i];
      var instances = res.Instances;
      for (var j = 0; j < instances.length; j++) {
          var nameTag = instances[j].Tags.filter((tag) => tag.Key === 'Name');
          if (nameTag) {
            name = nameTag[0].Value;
          }
          else {
            name = 'undefined';
          }

          if(instances[j].State.Code == 16){
            runningInstances.push(name);
          }
          else if(instances[j].State.Code == 80){
            stoppedInstances.push(name);
          }
        }
      }
      cb(runningInstances, stoppedInstances);
  });
}


function ec2List(bot, controller) {

  controller.hears(['ec2 list'], 'direct_message,direct_mention,mention', function(bot, message) {

    getEc2Instances(function(runningInstances, stoppedInstances){
      bot.reply(message, {
        attachments: [
          {
            color: '#fe9b28',
            pretext: `Current ec2 information for ${currentRegion} region`,
            fields: [
              {
                'title': 'Running',
                'value': runningInstances.join('\n'),
                'short': true,
              },
              {
                'title': 'Stopped',
                'value': stoppedInstances.join('\n'),
                'short': true,
              }
            ],
          }
        ],
      });
    });
  });
}

function helpMessage(bot, controller) {
  return `Lists the current ec2 instances.
\`@${bot.identity.name} ec2 list\``;
}

module.exports = {
  feature: ec2List,
  helpMessage
}
