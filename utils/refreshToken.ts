import { google } from "googleapis"
import { db } from "../firebase"

export async function getValidAccessToken(userId: string) {
	const userRef = db.collection("users").doc(userId)
	const userDoc = await userRef.get()

	if (userDoc.exists) {
		console.log("❌ 使用者不存在於firebase")
		const newAccessToken = await refreshAccessToken(userId)
		return newAccessToken
	}

	const userData = userDoc.data()
	if (Date.now() > userData?.expiresAt) {
		console.log("🔄 Token 過期，正在刷新...")
		const newAccessToken = await refreshAccessToken(userId)
		return newAccessToken
	}

	return userData?.accessToken
}

export async function refreshAccessToken(userId: string) {
	const userRef = db.collection("users").doc(userId)
	const userDoc = await userRef.get()

	if (!userDoc.exists) {
		throw new Error("使用者不存在！")
	}

	const userData = userDoc.data()
	const oauth2Client = new google.auth.OAuth2(
		process.env.CLIENT_ID,
		process.env.CLIENT_SECRET
	)

	if (!userData) {
		throw new Error("查無資料，系統異常！")
	}

	oauth2Client.setCredentials({
		refresh_token: userData.refreshToken,
	})

	const { credentials } = await oauth2Client.refreshAccessToken()
	await userRef.update({
		accessToken: credentials.access_token,
		expiresAt: Date.now() + (credentials.expiry_date || 3600 * 1000),
	})

	return credentials.access_token
}
