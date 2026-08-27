# 慧聚健康 (Huiju Health) - 全方位健康生活與照護綜合平台

![慧聚健康 Logo](frontend/public/assets/logo.jpg)

**慧聚健康 (Huiju Health)** 致力於打造專屬於每個家庭的全方位健康生活與照護綜合平台。我們結合預防保健、線上 1-on-1 專業健康諮詢、品質生活方案與智慧照顧數據追蹤，陪伴您與家人邁向更健康美好的未來。

本專案採用完全解耦的單頁應用程式 (SPA) 與 RESTful API 架構，並已由 SQLite 成功升級至企業級高並發 **PostgreSQL 16** 資料庫，完整支援台灣主流的**綠界科技 (ECPay)** 金流支付與超商物流系統。

---

## 🌿 品牌視覺與 CI 識別 (Brand Identity)

* **品牌主色 (Primary Color)**：草本翡翠綠 (`#2D6A4F`) —— 象徵自然純淨、專業可靠與生命活力。
* **輔助質感色 (Accent Color)**：尊爵香檳金 (`#C5A059`) —— 象徵頂級品質、尊榮服務與精緻細節。
* **背景與介面 (UI/UX)**：典雅極簡白搭草本綠微透玻璃質感 (Glassmorphism)，全站採用響應式 (RWD) 現代化設計。

---

## 🛠️ 技術棧與架構 (Tech Stack)

### 前端 (Frontend)
* **核心框架**：React 19 + TypeScript + Vite 8
* **圖示與組件**：Lucide React + 自訂 Glassmorphism 質感 UI 組件
* **狀態管理**：React Hooks + RESTful API 非步資料同步

### 後端 (Backend)
* **核心服務**：Node.js + Express + TypeScript (ESM)
* **資料庫 (Database)**：PostgreSQL 16 (採用 `pg` Connection Pool 連線池管理)
* **相容封裝層**：動態 SQL 參數轉換器 (將 `?` 佔位符即時轉換為 `$1, $2` 參數)
* **安全驗證**：bcrypt 密碼單向雜湊加密、Email 驗證碼 (OTP) 二次驗證機制

### 第三方金物流與部署 (Integrations & DevOps)
* **金物流串接**：綠界科技 (ECPay) AioCheckOut (信用卡/ATM/超商代碼) + 物流追蹤
* **容器化部署**：Docker + Docker Compose (PostgreSQL 16 Container + Express Backend)
* **版本控制與協作**：Git + GitHub (`https://github.com/h12s12bs/huiju-health-ecommerce.git`)

---

## 🚀 本地開發與啟動步驟 (Local Development)

### 步驟 1：啟動 PostgreSQL 資料庫服務
專案根目錄已設定 `docker-compose.yml`（獨立對外埠號 `5433`，避免與其他專案衝突）：
```bash
# 啟動 PostgreSQL 16 容器
docker-compose up postgres -d
```

### 步驟 2：後端 (Backend) 服務啟動
1. 進入後端目錄：
   ```bash
   cd backend
   ```
2. 安裝依賴套件：
   ```bash
   npm install
   ```
3. 確認 `.env` 資料庫連線設定：
   ```env
   PORT=5000
   DATABASE_URL=postgres://postgres:postgrespassword@localhost:5433/huiju_ecommerce
   ADMIN_TOKEN_SECRET=huiju_health_secret_key_2026
   ```
4. 啟動熱重載開發伺服器：
   ```bash
   npm run dev
   ```
   * 後端 API 服務將運行在 `http://localhost:5000`。
   * 首次啟動時，系統會自動建立 PostgreSQL 資料表結構並寫入「慧聚健康」預設服務與設定。

### 步驟 3：前端 (Frontend) 服務啟動
1. 進入前端目錄：
   ```bash
   cd frontend
   ```
2. 安裝依賴套件：
   ```bash
   npm install
   ```
3. 啟動 Vite 開發伺服器：
   ```bash
   npm run dev
   ```
   * 前端網頁將運行在 `http://localhost:5173`。

---

## 🔐 管理後台 (Admin Panel)

點擊前端右上角「登入 / 會員中心」，輸入管理員帳號即可切換至管理後台：

* **管理員帳號**：`admin@huiju-health.com` (或輸入 `admin`)
* **預設密碼**：`admin123`

### 後台核心功能：
1. **服務與商品架上管理**：即時新增、修改、下架預防保健與健康諮詢服務，支援自訂標籤與圖片上傳。
2. **訂單與出貨單 (Packing Slip)**：追蹤全站服務與產品訂單狀態，並支援一鍵列印隨箱撿貨出貨單。
3. **CRM 客戶與點數追蹤**：管理會員數據、消費總額、紅利點數與黑名單設定。
4. **全站內容與金流設定**：可自訂頂部公告、Hero 輪播 Banner、品牌簡介與綠界金流 HashKey / HashIV 配置。

---

## 💳 綠界金流 (ECPay) 安全機制

1. ** CheckMacValue 簽章驗證**：訂單建立時，後端自動以 SHA256 演算法計算綠界防偽簽章。
2. **IPN Webhook 自動回調處理**：用戶於綠界金流完成付款後，綠界伺服器回傳通知至 `/api/payments/ecpay-callback`，後端二次計算簽章核對無誤後自動更新訂單狀態為「已付款 / 待處理」。

---

## 🤝 團隊協作說明 (Team Collaboration)

本專案遠端 GitHub 儲存庫：
`https://github.com/h12s12bs/huiju-health-ecommerce.git`

如需邀請團隊夥伴共同開發，可前往 GitHub Repository 頁面：
**Settings $\rightarrow$ Collaborators $\rightarrow$ Add people**，輸入協作者的 GitHub 帳號或 Email 即可送出邀請信。
