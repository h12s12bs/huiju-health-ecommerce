# 樂肉選品 (Lè Ròu Select) - 客製化完全獨立電商系統

本專案是原本 WordPress 版本的客製化重構，完全移除 WordPress、WooCommerce 等臃腫系統，改為以 **React + Node.js (Express) + SQLite** 開發的高效能、低記憶體、安全性高的客製化電商網站。本專案已支援台灣主流的**綠界金流 (Ecpay)** 信用卡支付。

---

## 🛠️ 技術棧 (Tech Stack)

* **前端 (Frontend)**: React 19 + TypeScript + Vite 8
* **後端 (Backend)**: Node.js (Express) + TypeScript (Esm type: module)
* **資料庫 (Database)**: SQLite (單檔案嵌入式資料庫，極低開銷且免額外安裝)
* **金流串接 (Payment)**: 綠界科技 (Ecpay) AioCheckOut (全能結帳 V5)
* **部署容器化 (DevOps)**: Docker + Docker Compose + Nginx (反向代理與 SPA 路由)

---

## 🚀 本地開發啟動方式 (Local Development)

### 1. 後端 (Backend) 啟動
1. 進入後端目錄：
   ```bash
   cd backend
   ```
2. 安裝套件：
   ```bash
   npm install
   ```
3. 啟動開發伺服器（熱重載）：
   ```bash
   npm run dev
   ```
   * 後端服務將運行在 `http://localhost:5000`。
   * 首次啟動會自動在 `backend/data/` 下建立並初始化 `lerou_ecommerce.db` 資料庫，並預先寫入預設商品、管理員帳號與預設設定。

### 2. 前端 (Frontend) 啟動
1. 進入前端目錄：
   ```bash
   cd frontend
   ```
2. 安裝套件：
   ```bash
   npm install
   ```
3. 啟動開發伺服器：
   ```bash
   npm run dev
   ```
   * 前端服務將運行在 `http://localhost:5173`。

---

## 🔐 預設管理員登入資訊
在前端登入視窗，輸入以下電子郵件即可作為管理員登入，以進入**「管理後台 (ADMIN)」**進行商品上架、CRM 客戶追蹤與金流金鑰設定：

* **帳號 / 電子郵件**：`admin@lerou.com` (或輸入 `admin`)
* **預設密碼**：`admin123`

*(注意：密碼已在 SQLite 資料庫中使用 bcrypt 進行單向雜湊加密存儲，如需修改，可至資料庫中更新。)*

---

## 💳 綠界金流 (Ecpay) 串接說明

專案內建綠界金流測試特店帳號配置，已實作付款參數簽章演算法與 Webhook 自動防偽驗簽流程：

1. **付款流程**：
   * 當用戶選擇「綠界金流」結帳時，後端會根據購物車內容自動生成綠界要求的參數。
   * 計算 CheckMacValue (SHA256 簽章) 以防止金額被篡改。
   * 前端收到後端回傳的付款表單，會以 POST 方式將用戶自動導向綠界安全金流頁面。

2. **綠界 Webhook (IPN 回調) 驗證**：
   * 用戶完成付款後，綠界伺服器會以 POST 方式回傳付款結果至後端 Webhook 接收點 (`/api/payments/ecpay-callback`)。
   * 後端會解析回傳的參數，移除 `CheckMacValue` 後重新計算 SHA256 簽章，核對一致後才將訂單狀態改為「已付款 / 待出貨」。
   * 成功處理後，後端會回傳給綠界伺服器文字 `1|OK`，停止綠界的重複通知。

---

## 🐳 雲端生產環境部署指南 (AWS Lightsail 或 便宜 VPS)

本專案使用 **Docker Compose** 進行容器化打包，部署非常方便且成本極低（最低配置的 AWS Lightsail $3.5/月 即可順暢運作）：

### 步驟 1：在伺服器上安裝 Docker
對於 Linux Ubuntu 伺服器，可以執行以下指令：
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
```

### 步驟 2：上傳程式碼並啟動
將本專案目錄 `lerou-custom-ecommerce/` 複製到伺服器，並於根目錄下執行：
```bash
docker-compose up --build -d
```
* **Nginx 容器** 會自動在伺服器上監聽 `80` 端口。它會代理前端 React 靜態文件，並將 `/api/*` 的請求反向代理給後端容器（`port 5000`）。
* **SQLite 資料庫** 檔案會透過 Volume 映射到主機的 `backend/data/`，保證資料庫容器更新或重啟時，商品與訂單資料不會遺失。

### 步驟 3：設定 SSL 安全憑證 (HTTPS)
可以使用 `Certbot` 一鍵申請免費的 Let's Encrypt 憑證，並更新 Nginx 配置，以確保綠界 Webhook 的安全傳輸。
