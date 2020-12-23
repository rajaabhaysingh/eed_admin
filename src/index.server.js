const express = require("express");
const env = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

// managing routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin/auth");
const categoryRoutes = require("./routes/categories");
const courseRoutes = require("./routes/course");

env.config();

// middlewares
app.use(bodyParser.json());
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", categoryRoutes);
app.use("/api", courseRoutes);

// mongodb connection
// mongodb+srv://root:<password>@clustereed.bvlti.mongodb.net/<dbname>?retryWrites=true&w=majority

// connecting mongoose-online database
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@clustereed.bvlti.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then((res) => {
    console.log("Database connected");
  })
  .catch((err) => {
    console.log("Couldn't connect to database. ", err);
  });

PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Backend server running on", process.env.PORT);
});
