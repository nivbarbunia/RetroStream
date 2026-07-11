//ENVIRONMENT
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
require("dotenv").config();
//IMPORTS
const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");
//PORT
const PORT = 3000;
//EXECUTION
connectDB();
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    logger.logInfo(`Server started on port ${PORT}`);
});


