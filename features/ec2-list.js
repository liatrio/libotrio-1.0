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

// const states = {
//   0: "pending",
//   16: "running",
//   32: "shutting-down",
//   48: "terminated",
//   64: "stopping",
//   80: "stopped",
// }


// function findImage(amiId){
//   switch (amiId) {
//     case "ami-d0f506b0":
//       return "Amazon Linux";
//       break;
//     case "ami-d2c924b2":
//       return "Centos 7";
//       break;
//     case "ami-5ec1673e":
//       return "Amazon Linux";
//       break;
//     default: "other"
//   }
// }


// function prettifyIp(publicIP){
//   if(!publicIP){
//       return "no.ip.defined";
//   }
//   return publicIP;
// }

function queryEc2(){

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
  });
}

var runningInstances = new Array();

var stoppedInstances = new Array();

module.exports = function(bot, controller) {


  controller.hears(['ec2 list'], 'direct_message,direct_mention,mention', function(bot, message) {

    queryEc2();
    stoppedInstances = [];
    runningInstances = [];
    
    queryEc2();
    
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
    stoppedInstances = [];
    runningInstances = [];
  });
}
