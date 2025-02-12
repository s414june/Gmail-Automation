import admin from "firebase-admin"

// 🔹 讀取 Firebase 私密金鑰
// 🔹 重新構造 Firebase Service Account JSON
const serviceAccount = {
	type: "service_account",
	project_id: process.env.FIREBASE_PROJECT_ID,
	private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
	private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // 🔥 這行很重要，修復換行符號
	client_email: process.env.FIREBASE_CLIENT_EMAIL,
	client_id: process.env.FIREBASE_CLIENT_ID,
	auth_uri: process.env.FIREBASE_AUTH_URI,
	token_uri: process.env.FIREBASE_TOKEN_URI,
}

// 🔹 初始化 Firebase Admin
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
})

const db = admin.firestore() // ✅ 使用 Firestore
export { db }
