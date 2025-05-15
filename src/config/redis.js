const { createClient } = require("redis");
require("dotenv").config();

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
  },
});

redisClient.connect().catch(console.error);

module.exports = redisClient;
