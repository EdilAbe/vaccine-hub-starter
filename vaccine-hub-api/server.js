const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { PORT } = require("./config");
const { NotFoundError, BadRequestError } = require("./utils/errors");
const authRoutes = require("./routes/auth");
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use("/auth", authRoutes);
// if the end point that the user sends http request to doesn't not match any it will throw not found
app.use((req, res, next) => {
  return next(new NotFoundError());
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message;

  res.status(status).json({
    error: { message, status },
  });
});

app.listen(PORT, () => {
  console.log("server running http://localhost:" + PORT);
});
