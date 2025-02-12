const fs = require("fs")

// 讀取 `serviceAccount.json`
const clientSecret = require("./secretJson/clientSecret.json")
const serviceAccount = require("./secretJson/serviceAccount.json")

function transfer(fileName, redirectUrl) {
	const envData = `
CLIENT_ID=${clientSecret.web.client_id}
CLIENT_SECRET=${clientSecret.web.client_secret}
REDIRECT_URL=${redirectUrl}
FIREBASE_PROJECT_ID=${serviceAccount.project_id}
FIREBASE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}
FIREBASE_PRIVATE_KEY="${serviceAccount.private_key.replace(/\n/g, "\\n")}"
FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}
FIREBASE_CLIENT_ID=${serviceAccount.client_id}
FIREBASE_AUTH_URI=${serviceAccount.auth_uri}
FIREBASE_TOKEN_URI=${serviceAccount.token_uri}
`.trim()
	fs.writeFileSync(fileName, envData)
}

// 將 `.env` 寫入專案
transfer(".env", "http://localhost:5174/auth/callback")
transfer(".env.development", "http://localhost:5174/auth/callback")

console.log("✅ `serviceAccount.json` 已轉換為 `.env` `.env.development`！")
