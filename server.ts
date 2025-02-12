import dotenv from "dotenv"

// 依據 NODE_ENV 來選擇載入的 .env 檔案
const envFile =
	process.env.NODE_ENV === "development" ? ".env.development" : ".env"
dotenv.config({ path: envFile })

import express from "express"
import cors from "cors"
import path from "path"

const app = express()
const PORT = process.env.PORT || 3000
app.use(cors())
app.use(express.json())

import authRoutes from "./routes/auth"

// 註冊 OAuth API 路由
app.use("/api", authRoutes)

// 確保 `dist/` 的靜態檔案可以正確提供
app.use(express.static(path.join(__dirname, "dist")))

console.log(`Server staring...`)

// Vercel Serverless Function 需要 `module.exports`
if (process.env.VERCEL) {
	console.log(`✅ Server is running on Vercel`)
	module.exports = app
} else {
	app.listen(PORT, () => {
		console.log(`✅ Server is running on port ${PORT}`)
	})
}

// import { db } from "./firebase"

// async function testFirestoreWrite() {
// 	try {
// 		await db.collection("users").doc("test-user").set({
// 			name: "Test User",
// 			email: "test@example.com",
// 			createdAt: new Date(),
// 		})
// 		console.log("✅ Firestore 寫入成功！")
// 	} catch (error) {
// 		console.error("❌ Firestore 寫入失敗：", error)
// 	}
// }

// testFirestoreWrite()
