const redis = require("../config/redis");

async function publishMessage(channel, message) {
  await redis.publish(channel, JSON.stringify(message));
}

module.exports = publishMessage;
