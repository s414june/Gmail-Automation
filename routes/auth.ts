import express from "express"
import { google } from "googleapis"

const router = express.Router()

const allowedEmails = ["your-email@gmail.com", "another-user@gmail.com"]

const oauth2Client = new google.auth.OAuth2(
	process.env.CLIENT_ID,
	process.env.CLIENT_SECRET,
	process.env.REDIRECT_URL
)

// 🔹 OAuth 2.0 登入
router.get("/auth/login", (req, res) => {
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: [
			"https://www.googleapis.com/auth/gmail.readonly",
			"https://www.googleapis.com/auth/drive.file",
		],
	})
	res.json({ url: authUrl })
})

// 🔹 OAuth 2.0 Callback（授權完成後）
router.get("/auth/callback", async (req, res) => {
	const code = req.query.code as string

	try {
		const { tokens } = await oauth2Client.getToken(code)
		oauth2Client.setCredentials(tokens)

		res.json({
			success: true,
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
		})
	} catch (error) {
		res.status(500).json({ success: false, message: "授權失敗" })
	}
})

export default router
