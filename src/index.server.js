const express = require("express");
const env = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.2",
    info: {
      version: "1.0.0",
      title: "eEd backend APIs",
      description: "Documentation for eEd backend APIs",
      contact: {
        name: "Raja Abhay Singh",
      },
      servers: ["http://localhost:2000"],
    },
  },
  // [".routes/*.js", "./routes/admin/*.js"]
  apis: ["./routes/auth"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// managing routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin/auth");
const categoryRoutes = require("./routes/categories");
const courseRoutes = require("./routes/course");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const paymentRoutes = require("./routes/payment");

env.config();

// middlewares
app.use(cors());
app.use(express.json());
// documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
// static files
app.use("/static", express.static(path.join(__dirname, "uploads")));
app.use("/private", express.static(path.join(__dirname, "profile_pic")));
app.use(
  "/course-content",
  express.static(path.join(__dirname, "course_content"))
);
// apis
app.use("/api", authRoutes);
app.use("/api", adminRoutes);
app.use("/api", categoryRoutes);
app.use("/api", courseRoutes);
app.use("/api", cartRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentRoutes);

// connecting mongoose-online database
mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@clustereed.bvlti.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
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
