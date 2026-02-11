const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/complaints", require("./routes/complaints"));
app.use("/api/votes", require("./routes/votes"));
app.use("/api/comments", require("./routes/comments"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
