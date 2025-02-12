import dotenv from "dotenv"

// 依據 NODE_ENV 來選擇載入的 .env 檔案
const envFile =
	process.env.NODE_ENV === "development" ? ".env.development" : ".env"
dotenv.config({ path: envFile })

import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

import authRoutes from "./routes/auth"

// 註冊 OAuth API 路由
app.use("/api", authRoutes)

app.listen(3000, () => {
	console.log("🚀 Express API 運行於 http://localhost:3000")
})

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
