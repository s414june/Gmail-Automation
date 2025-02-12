import express from "express"
import { google } from "googleapis"
import { Credentials } from "google-auth-library"
import { db } from "../firebase" // 🔹 引入 Firebase DB
import { getValidAccessToken } from "../utils/refreshToken"

const router = express.Router()

const allowedEmails = ["s414june@gmail.com", "another-user@gmail.com"]

const oauth2Client = new google.auth.OAuth2(
	process.env.CLIENT_ID || "",
	process.env.CLIENT_SECRET || "",
	process.env.REDIRECT_URL || ""
)

// 🔹 OAuth 2.0 登入
router.get("/auth/login", (req, res) => {
	console.log("login")
	const authUrl = oauth2Client.generateAuthUrl({
		access_type: "offline",
		prompt: "consent",
		scope: [
			"https://www.googleapis.com/auth/gmail.readonly",
			"https://www.googleapis.com/auth/drive.file",
			"https://www.googleapis.com/auth/userinfo.email",
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

// 🔹 OAuth 交換 Token 並取得 User Info
router.post("/auth/exchange", async (req: any, res: any) => {
	const { code } = req.body

	if (!code) {
		return res
			.status(400)
			.json({ success: false, message: "缺少授權碼 (code)" })
	}

	try {
		console.log("📌 嘗試交換 Token，code:", code)
		const { tokens } = await oauth2Client.getToken(code)
		console.log("✅ 交換成功，tokens:", tokens)

		oauth2Client.setCredentials(tokens)
		console.log("✅ 設定 OAuth2 憑證成功！")

		const userId = await setDBAndGetUserId(tokens)

		return res.json({
			success: true,
			userId,
			accessToken: tokens.access_token,
			refreshToken: tokens.refresh_token,
			expiresAt: Date.now() + (tokens.expiry_date || 3600 * 1000),
		})
	} catch (error) {
		console.error("❌ OAuth 交換 Token 失敗:", error)
		return res
			.status(500)
			.json({ success: false, message: "交換 Token 失敗，原因：" + error })
	}
})

// 🔄 刷新 Access Token API
router.post("/auth/refresh", async (req: any, res: any) => {
	const { userId } = req.body

	if (!userId) {
		return res.status(400).json({ success: false, message: "缺少 userId" })
	}
	getValidAccessToken(userId)
})

async function setDBAndGetUserId(tokens: Credentials) {
	try {
		// 🔹 透過 Google API 取得使用者資訊
		oauth2Client.setCredentials({
			access_token: tokens.access_token,
			refresh_token: tokens.refresh_token,
			expiry_date: tokens.expiry_date,
		})

		const accessToken = oauth2Client.credentials.access_token

		const response = await fetch(
			"https://www.googleapis.com/oauth2/v2/userinfo",
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					"Content-Type": "application/json",
				},
			}
		)

		const userInfo = await response.json()
		console.log("✅ 取得使用者資訊:", userInfo)

		if (!userInfo.email) {
			throw new Error("無法獲取使用者 Email")
		}

		const userId = userInfo.email // 🔥 這裡使用 Email 作為 userId（你也可以用 userInfo.data.id）

		// 🔹 儲存 Token 到 Firestore
		await db
			.collection("users")
			.doc(userId)
			.set(
				{
					accessToken: tokens.access_token,
					refreshToken: tokens.refresh_token,
					expiresAt: Date.now() + (tokens.expiry_date || 3600 * 1000),
					email: userInfo.email,
				},
				{ merge: true } // ✅ 確保不覆蓋舊資料
			)

		console.log(`✅ Firestore 成功更新 userId: ${userId}`)
		return userId
	} catch (error: any) {
		throw error
	}
}

export default router
