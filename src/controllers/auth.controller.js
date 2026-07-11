const bcrypt = require("bcrypt");
const User = require("../models/user.model");
const logger = require("../utils/logger");

// REGISTER 
async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "שדות חסרים" });
        }

        const exists = await User.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "אימייל כבר רשום" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        req.session.userId = user._id;
        logger.logInfo(`New user registered: ${email}`);
        res.status(201).json({ success: true });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ success: false, message: "נתוני משתמש לא תקינים", error: err.message });
        }
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// LOGIN 
async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.json({ success: false, message: "שדות חסרים" });
        }

        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            logger.logInfo(`Login success: ${email}`);
            return res.json({ success: true, role: user.role });
        }
        logger.logInfo(`Login failed: ${email}`);
        return res.json({ success: false, message: "אימייל או סיסמא שגויים" });
    } catch (err) {
        logger.logError(req.originalUrl, err);
        res.status(500).json({ success: false, message: "שגיאת שרת", error: err.message });
    }
}

// LOGOUT
function logout(req, res) {
    req.session.destroy();
    res.json({ success: true });
}

module.exports = { register, login, logout };