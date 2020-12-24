const express = require("express");
const env = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");

const app = express();

// managing routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin/auth");
const categoryRoutes = require("./routes/categories");
const courseRoutes = require("./routes/course");
const cartRoutes = require("./routes/cart");

env.config();

// middlewares
app.use(express.json());
app.use("/static", express.static(path.join(__dirname, "uploads")));
app.use("/course-content", express.static(path.join(__dirname, "uploads")));
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", categoryRoutes);
app.use("/api", courseRoutes);
app.use("/api", cartRoutes);

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
  console.log("Backend server running on PORT", PORT);
});
