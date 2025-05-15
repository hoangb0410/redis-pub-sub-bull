const redis = require("../config/redis");

async function subscribeToChannel(channel) {
  const subscriber = redis.duplicate();
  await subscriber.connect();
  await subscriber.subscribe(channel, (message) => {
    console.log(`[SUBSCRIBER] Message from ${channel}:`, message);
  });
}

module.exports = subscribeToChannel;
