# 大芊世界 EGG｜YouTube 神明影片逐字稿 APP

本專案以 **31 部影片索引**為起點。請注意：影片索引 ≠ 已轉錄完成；無字幕的影片無法只靠 YouTube 網址辨識聲音。

## 網頁預覽（不含字幕擷取後端）

https://pink1688.github.io/2777/egg-transcript/

此 Github Pages 預覽版支援影片搜尋、字幕檔匯入、重點擷取與原句收藏。按「讀取 YouTube 字幕」時會提示服務未連線。

## 在 Netlify 啟用真正的字幕擷取

1. 登入 https://app.netlify.com/start ，選 **Import from Git**。
2. 選擇 GitHub 儲存庫 **pink1688/2777**。
3. **Base directory** 設為 `egg-transcript`。發佈目錄 `site`，Functions 目錄 `netlify/functions`，Build command `npm run build`。
4. 進行首次部署。網站狀態欄應顯示「字幕服務已連線」。
5. 選擇一部有公開字幕的 YouTube 影片，按「一鍵讀取本片字幕」。

**注意**：因 YouTube 可能限制擷取，任何影片都不保證一定能取得字幕；會員影片、私人影片、無字幕影片仍可能失敗。由字幕擷取的內容會標示「未人工核對講者」，不會虛構原句。

## 資料處理

- 已有字幕：Netlify Function 使用 `youtube-caption-extractor`，失敗時以 `youtube-transcript` 備援。
- 本機檔案：支援 SRT/VTT/TXT 字幕匯入；音檔語音辨識仍受裝置與網路限制。
- 批次：逐部嘗試，對失敗項目顯示原因，**不表示所有影片已轉錄成功**。
- 金句：從實際字幕原文收藏，非自行改寫，講者歸屬仍須核對。

本專案與原本的 `egg-app` 分開，避免覆蓋你的「神明原話金句 APP」。
