
'use strict';

const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
const sns = new AWS.SNS();
const faker = require('faker');

const topic = 'arn:aws:sns:us-west-2:535398244858:pickup.fifo';

class Order{ 
  constructor(){
  this.storeName = 'widgets',
  this.orderId = faker.random.uuid(),
  this.customer = `${faker.name.firstName()}`,
  this.vendorID = 'https://sqs.us-west-2.amazonaws.com/535398244858/Widgets'
  }
}


setInterval(() => {
  const params = {
    MessageGroupId: 'test',
    MessageDeduplicationId: faker.random.uuid(),
    TopicArn: topic,
    Message: JSON.stringify(new Order()),
  };
  sns.publish(params).promise().then(console.log).catch(console.error);
}, 5000)
