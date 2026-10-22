# Build Adapter｜Stage 2.7E

正式資料流：私人 Google Sheets → build-time Adapter → validation → `content/generated/` → Next.js static export。

## 正式建置

1. 將唯讀 Service Account 加為既有 Workbook 的 Viewer。
2. 在 GitHub repository Secrets 設定三個名稱：
   - `SEWFUNLIFE_SPREADSHEET_ID`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
3. 執行 `npm ci`、`npm test`、`npm run lint`、`npm run typecheck`、`npm run build`。

`npm run build` 一律依序 seed → live sync → validate → Next build。缺憑證、網路失敗、契約錯誤會退出非零狀態，Actions 不會繼續 upload/deploy。Service Account 及 Workbook 的實際唯讀權限仍須另行驗收；程式僅要求 Sheets readonly OAuth scope，不使用 Drive scope。

本機敏感值只放 gitignored `.env.local`；Node >=20.19 可自動載入。既有環境變數優先。Private Key 支援真正換行或字面 `\n`。不要把值貼入聊天、報告、repo 或瀏覽器。

## 本機開發與驗證

- `npm run dev`：seed site；尚無 generated 資料時建立明確的合成 fixture，之後驗證 receipt。
- `npm run content:sync`：使用 Service Account 真實唯讀同步。
- `npm run content:validate`：檢查 generated、hash receipt、型別、FK、公開與隱私條件。
- `npm run content:fixture`：使用 `tests/fixtures/workbook.json` 的合成測試內容。
- `npm run build:fixture`：完整合成資料靜態建置；用於可重現的無憑證驗證。
- `npm run content:snapshot -- /absolute/private/workbook.json`：本機已連接工具取得的唯讀快照驗證。
- `npm run build:snapshot -- /absolute/private/workbook.json`：快照完整靜態建置。

fixture／snapshot 指令在 CI、GitHub Actions、Vercel 或 NODE_ENV=production 中會拒絕執行。它們不會被正式 build 呼叫，不能滿足正式 build 的 live receipt 要求。`next build` 會在生產模式讀取 loader；只有明確本機驗證 wrapper 能允許非 live receipt。直接使用 `next build` 不代表執行完整的正式 sync pipeline，部署必須使用 `npm run build`。

快照格式為 `{工作表名稱: [第4列欄名, ...第5列起資料]}`，只包含七張白名單表。原始快照可能含 private 值，須放 repo 外；不提交、也不放 public、generated 或測試 fixture。任何快照建置成功都不代表 Service Account 的實際授權已驗收。

## 契約、投影與隱私

- `網站_Schema`：提供 field_key、繁中欄名、型別、required、visibility、列表語意。
- `網站_Terms`：提供繁中核定標籤 → stable system key。只接受已確認的正式標籤；別名不當成自動 fallback。
- `scripts/content/contract.json`：Stage 2.7C/D 的固定欄位契約斷言；偵測欄位刪改及 visibility 降級，沒有第二份中文 mapping。修改正式 Schema 後須另經治理驗收才更新此檔及型別。
- stable system keys 具有政策語意；不得把 archived/pending/private 等 key 改名來繞過過濾。
- difficulty_level 為 1–5 integer（Schema Review 的數值規格），不製造不存在的 Terms domain。
- 只有 Schema 明定列表的 highlights 按全形分號切分；一般文字不擅自拆分。
- 所有輸入列都驗證，含草稿。缺欄、無標題欄位卻有資料、未知 Terms、duplicate ID/slug、FK 斷裂都 fail。
- 輸出採欄位投影；Schema.private 永不輸出，另排除只供 build 的 legacy_source/notes/privacy_note/material_fee_note。
- internal ID、排序、路徑與政策狀態可供 loader 使用；前端只將 Schema.public 欄位當文案顯示。
- Course／Session／Instructor／FAQ 先按 published 與公開父層過濾。Media 再檢查 usage、privacy、關聯、Session 可見性。
- 講師照片透過公開 Instructor.photo_media_id 反向關聯；未被公開講師使用的照片不輸出。
- private/pending 或社群／內部用途的媒體即使 published=true 仍不輸出。關聯到被排除媒體的封面／講師照片 reference 會清空，避免懸空指向。
- 封面備援只在已公開且已通過政策的 Course media 裡尋找，不使用 private source_url。
- 相對圖片預設解析到 `/work/`；可選 `ASSET_BASE_URL` 設為 HTTPS 資產目錄。拒絕 traversal、protocol-relative、data URL 與 URL credentials。
- 測試 fixture 的 Schema／Terms 僅供測試；正式路徑永遠由 live Sheets 讀取。

每次 sync 在認證與讀取前清除 generated 與 receipt；成功後寫出五個 JSON 及 build-only hash receipt（`.cache/sewfunlife-content/`）。前端不讀 raw Terms／Schema，不接觸憑證。`content.example/site.json` 保留低頻全站設定責任；不 seed 舊 projects/images。

新 loader 直接供應 Course／Media。`Asset` 僅是圖片呈現形狀，沒有反向建立 Portfolio 的 Project/palette/typography/plates Source of Truth。保留既有 `/work/<slug>/` 網址、主要 CSS 與互動，移除已無資料責任的模板分支；作品展示由 work_showcase 供應，未當作 Session 花絮。

## 部署邊界

本任務只在隔離分支保存；不自動 merge、部署或宣告 Stage PASS。Pages workflow 只在原有 main push／手動 dispatch 執行。Vercel 的三個環境變數須獨立配置；本輪未設定平台 Secrets，也未手動部署；既有 Vercel Git 整合會自動嘗試 Preview，實際狀態見施工結果報告。
