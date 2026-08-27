# 樂肉選品自訂網域與生產環境配置指南 (Domain Setup Guide)

本指南將引導您如何將新購買的網域配置到本電商平台上，涵蓋 **DNS 設定**、**Nginx 反向代理與 SSL 憑證**、**環境變數更新** 以及 **綠界 (ECPay) 金物流回傳設定**。

---

## 📋 步驟一：DNS 記錄設定 (Squarespace DNS Configuration)

如果您是在 **Squarespace** 購買網域，請按照以下步驟進行設定：

1. **登入您的 Squarespace 帳戶**，進入控制面板。
2. 在左側選單中，點選 **Domains (網域)**。
3. 點選您剛購買的網域名稱，進入網域設定頁面。
4. 點選右上角的 **DNS Settings (DNS 設定)** 按鈕。
5. 在 DNS 管理頁面中，尋找 **Custom Records (自訂記錄)** 區塊。
6. 點選 **Add (新增記錄)**，並依照下表新增兩筆 DNS 記錄：

| 記錄類型 (Type) | 主機記錄 (Host) | 記錄值 (Value/Data) | 說明 (Description) |
| :--- | :--- | :--- | :--- |
| **A** | `@` | `您的伺服器公網 IP` | 將根網域（例如 `example.com`）指向您的伺服器。 |
| **CNAME** | `www` | `您的主網域名稱` (例如 `example.com`) | 將 `www.example.com` 導向主網域。 |

7. 設定完成後點選 **Save (儲存)**。

> [!NOTE]
> * DNS 記錄生效時間一般在 5 分鐘至 24 小時之內。
> * 您可以使用 Linux 終端機執行 `dig yourdomain.com` 或 `nslookup yourdomain.com` 來查詢 DNS 解析是否已生效。

---

## 🔒 步驟二：Nginx 反向代理與 Let's Encrypt SSL 設定
為了確保傳輸安全（綠界金物流回傳 API 強制要求 **HTTPS** 公網環境），我們必須使用 Nginx 作為反向代理伺服器，並安裝 Let's Encrypt SSL 免費憑證。

### 1. 安裝 Nginx 與 Certbot
在您的 Linux 伺服器上執行以下指令：
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 2. 建立 Nginx 設定檔
建立一個新的網站設定檔：
```bash
sudo nano /etc/nginx/sites-available/lerou
```
寫入以下配置（將 `example.com` 替換為您的新網域）：
```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    # 1. 前端靜態資源 (Vite Build / Dist 目錄)
    location / {
        root /home/kevin87332000/lerou-custom-ecommerce/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 2. 後端 API 代理 (Node.js Express 運行於 3001 端口)
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;model
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 啟用設定並安裝 SSL
啟用該 Nginx 設定並測試其正確性：
```bash
sudo ln -s /etc/nginx/sites-available/lerou /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
執行 Certbot 自動獲取並配置 SSL 憑證：
```bash
sudo certbot --nginx -d example.com -d www.example.com
```
*在流程中，選擇將 HTTP 流量重定向至 HTTPS (Option 2: Redirect)。*

---

## ⚙️ 步驟三：更新專案環境變數 (.env)
成功配置網域與 SSL 後，需要更新伺服器上的環境變數：

### 1. 後端環境變數 (`backend/.env`)
編輯 `/home/kevin87332000/lerou-custom-ecommerce/backend/.env` 並更新如下：
```env
PORT=3001
# 更新為您綁定的真實 HTTPS 公網網址（綠界付款與物流回傳需要）
FRONTEND_URL=https://example.com
BACKEND_URL=https://example.com
```

### 2. 前端環境變數 (`frontend/.env` 或生產環境常數)
如果您在本地編譯前端，請確保 `BACKEND_URL` 被設定為網域名稱。由於 Nginx 已經將 `/api/` 請求反向代理給 Express，因此生產環境下：
```env
VITE_BACKEND_URL=https://example.com
```

> [!IMPORTANT]
> 修改變數後，請務必重啟後端 Node.js 服務以載入新的變數：
> ```bash
> pm2 restart all # 若您使用 PM2 進行後台進程管理
> ```

---

## 💳 步驟四：綠界科技 (ECPay) 金流與物流對接重點

綠界科技在交易完成或物流狀態變更時，會通過**非同步的 POST 請求**將狀態直接發送到您的後端伺服器（非瀏覽器請求，因此 localhost 無法接收）。

### 1. 付款狀態回傳 (ReturnURL)
*   **回傳路由**: `/api/payments/ecpay-callback`
*   **安全驗證**: 收到回傳後，後端會自動比對 SHA256 加密特徵碼（CheckMacValue），避免惡意偽造付款成功。

### 2. 物流狀態回傳 (LogisticsReplyURL)
*   **回傳路由**: `/api/payments/ecpay-logistics-callback`
*   **回傳參數**: `AllPayLogisticsID` (綠界物流單號), `Status` (物流狀態), `StatusName` (狀態說明)。
*   **觸發場景**: 當商品抵達門市、買家取貨完成、或派送失敗時，綠界伺服器會主動回傳至此。

> [!TIP]
> 預設專案在測試環境下，綠界金流會採用測試 MerchantID (`2000040`) 與對應的 HashKey/HashIV。當您正式開通綠界帳號拿到正式特店 ID 後，可以直接在**後台管理系統 -> 串接設定** 填寫，即可無縫切換到生產付款模式。
