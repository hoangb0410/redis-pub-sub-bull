const Queue = require("bull");
require("dotenv").config();

const jobQueue = new Queue("user-jobs", {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

module.exports = jobQueue;
