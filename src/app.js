require("dotenv").config();
const express = require("express");
const userRoutes = require("./routes/user.routes");
const subscribeToChannel = require("./pubsub/subscriber");
require("./queue/worker");

const app = express();
app.use(express.json());

app.use("/users", userRoutes);

// Start Redis Subscriber
["user_created", "user_updated", "user_deleted"].forEach(subscribeToChannel);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
