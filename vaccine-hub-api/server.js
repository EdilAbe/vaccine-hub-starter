const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());

app.use(morgan("tiny"));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log(`server running htttp://localhost:$(PORT)`));
