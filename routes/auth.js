"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleapis_1 = require("googleapis");
const router = express_1.default.Router();
const allowedEmails = ["s414june@gmail.com", "another-user@gmail.com"];
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.CLIENT_ID || "", process.env.CLIENT_SECRET || "", process.env.REDIRECT_URL || "");
// 🔹 OAuth 2.0 登入
router.get("/auth/login", (req, res) => {
    console.log(oauth2Client);
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/gmail.readonly",
            "https://www.googleapis.com/auth/drive.file",
        ],
    });
    res.json({ url: authUrl });
});
// 🔹 OAuth 2.0 Callback（授權完成後）
router.get("/auth/callback", async (req, res) => {
    const code = req.query.code;
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        res.json({
            success: true,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "授權失敗" });
    }
});
router.post("/auth/exchange", async (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res
            .status(400)
            .json({ success: false, message: "缺少授權碼 (code)" });
    }
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        return res.json({
            success: true,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
        });
    }
    catch (error) {
        console.error("OAuth 交換 Token 失敗:", error);
        return res.status(500).json({ success: false, message: "交換 Token 失敗" });
    }
});
exports.default = router;
