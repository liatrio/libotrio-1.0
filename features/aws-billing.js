// Provides AWS billing information

var AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-1', // Cloudwatch billing is located in N. Virginia server
  correctClockSkew: true
});
var cloudwatch = new AWS.CloudWatch();

// Returns promise for the estimated amount charged between startTime and endTime
function getEstimatedCharges(startTime, endTime) {
  var params = {
    MetricName: 'EstimatedCharges',
    Namespace: 'AWS/Billing',
    StartTime: startTime,
    EndTime: endTime,
    Period: 3600, // Accurate within 1 hour
    Dimensions: [ { Name: 'Currency', Value: 'USD'} ],
    Statistics: ['Sum']
  };
  return cloudwatch.getMetricStatistics(params).promise().then(function(data) {
    return data.Datapoints.reduce(function(d1,d2) {
      return Math.max(d1, d2.Sum);
    },0);
  });
}

// Returns promise for the estimated previous-month charges across all services.
function estimatePreviousMonthCharges() {
  var today = new Date();
  var firstOfPrevMonth = new Date(today.getFullYear(), today.getMonth()-1, 1);
  var lastOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  return getEstimatedCharges(firstOfPrevMonth, lastOfPrevMonth);
}

// Returns promise for the estimated month-to-date charges across all services.
function estimateMonthToDateCharges() {
  var today = new Date();
  var firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return getEstimatedCharges(firstOfMonth, today);
}

// Returns promise for the estimated forecast of charges across all services
// for this month.
function estimateForecastCharges() {
  var today = new Date();
  var firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  var lastOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);
  return estimateMonthToDateCharges().then(function(monthToDateCharges) {
    // chargeForMonth = (chargeNow * timeForMonth)/timeToNow
    return (monthToDateCharges * (lastOfMonth.getTime() - firstOfMonth.getTime()))/(today.getTime() - firstOfMonth.getTime());
  });
}

// Asynchronously generate report with previous-month, month-to-date, and
// forecast charges.
function generateBillingReport() {
  report = {};
  return Promise.all([
    estimatePreviousMonthCharges().then(function(charges) {
      report.previousMonthCharges = charges;
    }),
    estimateMonthToDateCharges().then(function(charges) {
      report.monthToDateCharges= charges;
    }),
    estimateForecastCharges().then(function(charges) {
      report.forecastCharges = charges;
    })
  ]).then(function() {
    return report;
  });
}

// Installs aws-billing feature to bot
function awsBilling(bot, controller) {

  controller.hears(['aws billing'], 'direct_message,direct_mention', function(bot, message) {
    generateBillingReport().then(function(report) {
      bot.reply(message, {
        attachments: [
          {
            color: '#36a64f',
            title: 'AWS Billing Summary',
            title_link: 'https://console.aws.amazon.com/billing/home?region=us-west-2',
            fields: [
              {
                title: 'Previous Month Charges',
                value: '$' + report.previousMonthCharges.toFixed(2),
                short: true,
              },
              {
                title: 'Month-To-Date Charges',
                value: '$' + report.monthToDateCharges.toFixed(2),
                short: true,
              },
              {
                title: 'Forecast Charges For This Month',
                value: '$' + report.forecastCharges.toFixed(2),
                short: true,
              },
            ],
            fallback: 'Previous Month: $' + report.previousMonthCharges.toFixed(2) +
                ', Month-To-Date: $' + report.monthToDateCharges.toFixed(2) +
                ', Forecast For This Month: $' + report.forecastCharges.toFixed(2),
          }
        ]
      });
    });
  });

}

module.exports = awsBilling;
