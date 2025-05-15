const jobQueue = require("./jobQueue");

jobQueue.process(async (job) => {
  console.log("[BULL] Processing job:", job.data);
});
