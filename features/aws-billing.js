// Provides AWS billing information

var AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-1', // Cloudwatch billing is located in N. Virginia server
  correctClockSkew: true
});
var cloudwatch = new AWS.CloudWatch();

// Retrieves the estimated amount charged between startTime and endTime
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

// Returns the estimated month-to-date charges accross all services
function estimateMonthToDateCharges() {
  var today = new Date();
  var firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  return getEstimatedCharges(firstOfMonth, today);
}

// Forcast charges for this month
function forecastCharges() {
  var today = new Date();
  var firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  var lastOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);
  return estimateMonthToDateCharges().then(function(monthToDateCharges) {
    // chargeForMonth = (chargeNow * timeForMonth)/timeToNow
    return (monthToDateCharges * (lastOfMonth.getTime() - firstOfMonth.getTime()))/(today.getTime() - firstOfMonth.getTime());
  });
}

forecastCharges().then(function(charges) {
  console.log(charges);
}).catch(function(err) {
  console.log(err, err.stack);
});
