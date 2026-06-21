const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// הגשת קבצים סטטיים מתיקיית RetroStream
app.use(express.static(path.join(__dirname, "RetroStream")));

// GET / — מחזיר את עמוד ההתחברות
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "RetroStream", "Login.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});