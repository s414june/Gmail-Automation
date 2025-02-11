"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// 依據 NODE_ENV 來選擇載入的 .env 檔案
const envFile = process.env.NODE_ENV === "development" ? ".env.development" : ".env";
dotenv_1.default.config({ path: envFile });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const auth_1 = __importDefault(require("./routes/auth"));
// 註冊 OAuth API 路由
app.use("/api", auth_1.default);
app.listen(3000, () => {
    console.log("🚀 Express API 運行於 http://localhost:3000");
});
