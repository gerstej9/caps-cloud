'use strict';

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
// Set the region
AWS.config.update({region: 'us-west-2'});

// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});


function sendMessage(orderId, customer, url){
  var params = {
    // Remove DelaySeconds parameter and value for FIFO queues
   DelaySeconds: 2,
   MessageBody: JSON.stringify({status: 'delivered', orderId: orderId, customer: customer}),
   QueueUrl: url
 };
 
 sqs.sendMessage(params, function(err, data) {
   if (err) {
     console.log("Error", err);
   } else {
     console.log("Success", data.MessageId);
   }
 });
}


var queueURL = "https://sqs.us-west-2.amazonaws.com/535398244858/packages.fifo";

var params = {
 AttributeNames: [
    "SentTimestamp"
 ],
 MaxNumberOfMessages: 1,
 MessageAttributeNames: [
    "All"
 ],
 QueueUrl: queueURL,
 VisibilityTimeout: 20,
 WaitTimeSeconds: 0
};

setInterval(() => {
  sqs.receiveMessage(params, function(err, data) {
    if (err) {
      console.log("Receive Error", err);
    } else if (data.Messages) {
      let parsedData = JSON.parse(data.Messages[0].Body);
      console.log(JSON.parse(parsedData.Message));
      let parsedMessage = JSON.parse(parsedData.Message);
      sendMessage(parsedMessage.orderId, parsedMessage.customer, parsedMessage.vendorID);
      var deleteParams = {
        QueueUrl: queueURL,
        ReceiptHandle: data.Messages[0].ReceiptHandle
      };
      sqs.deleteMessage(deleteParams, function(err, data) {
        if (err) {
          console.log("Delete Error", err);
        } else {
          console.log("Message Deleted", data);
        }
      });
    }
  });
}, 5000)


