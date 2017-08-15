const defaultRegion = process.env.AWS_DEFAULT_REGION || 'us-west-2';

const validStatuses = [
  'pending',
  'running',
  'shutting-down',
  'terminated',
  'stopping',
  'stopped'
];

const validRegions = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'eu-west-1',
  'eu-central-1',
  'eu-west-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-south-1',
  'sa-east-1'
];

var AWS = require('aws-sdk');


//check that the status is legit
function validateStatus(status) {
  return validStatuses.includes(status);
}

//check that the region is legit
function validateRegion(region) {
  return validRegions.includes(region);
}

function generateInstanceReport(data, cb) {

  if (data.Reservations.length == 0) {
    cb("No reservations to report in this region :sunglasses:");
    return;
  }

  let attachments = [];

  for (let i = 0; i < data.Reservations.length; i++){
    for (let j = 0; j < data.Reservations[i].Instances.length; j++) {
      let block = "";
      let name = "";

      block += data.Reservations[i].Instances[j].InstanceType + "\n";

      for (let k = 0; k < data.Reservations[i].Instances[j].Tags.length; k++) {
        if (data.Reservations[i].Instances[j].Tags[k].Key == 'Name') {
          name = data.Reservations[i].Instances[j].Tags[k].Value || "Untitled";
        }
      }
      block += data.Reservations[i].Instances[j].PublicIpAddress + "\n";
      block += data.Reservations[i].Instances[j].KeyName;

      attachments.push({
        title: name,
        color: (attachments.length % 2 ? '#64b6db' : '#ece1ce'),
        text: '```' + block + '```',
        mrkdwn_in: ['text']
      });
    }
  }
  cb({attachments});
}

// Installs aws-list feature to bot
function awsListInstances(bot, controller) {
  controller.hears(['aws list instances ([a-z]+) ([a-z]+-[a-z]+-[0-9])*'], 'direct_message,direct_mention', function(bot, message) {

    let text = message.text.split(' ');

    let status = text[3];
    let region = ( text.length == 5 ? text[4] : defaultRegion );

    if (!validateStatus(status)) {
      //send error message
      bot.reply(message, `Invalid status, please use a supported one instead`);
      return;
    }

    if (!validateRegion(region)) {
      //send error message
      bot.reply(message, ':flag-kp: Invalid region specified');
      return;
    }

    let params = {
      DryRun: false,
      Filters: [
        {
          Name: 'instance-state-name',
          Values: [status],

        }
      ]
    };

    AWS.config.update({region});

    var ec2 = new AWS.EC2();

    ec2.describeInstances(params, function (err, data) {
      if (err) {
        console.log(err, err.stack);
        bot.reply(message, ':weary: Unable to describe instances, something went wrong');
      }
      else {
        generateInstanceReport(data, function (attachments) {
          //console.log(attachments)
          bot.reply(message, attachments);
        });
      }
    });
  });
}


function helpMessage(bot, controller) {
  return `Genereates a list of ec2 instances on AWS with a given status.
\`@${bot.identity.name} aws list instances <status> <region>\'
statuses: pending, running, terminated, stopping, stopped;`;
}

module.exports = {
  feature: awsListInstances,
  helpMessage,
};

/*
0: pending
16 : running
32 : shutting-down
48 : terminated
64 : stopping
80 : stopped
*/
