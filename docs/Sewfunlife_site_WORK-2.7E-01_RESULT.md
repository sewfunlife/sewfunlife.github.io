# WORK-2.7E-01｜Build Adapter 施工結果

- Task ID：WORK-2.7E-01
- Execution Status：**PARTIAL / BLOCKED-LIVE-VERIFY**
- 日期：2026-10-22（Asia/Taipei）
- Base commit：`7ce7f3198a4f911e1f8deab91a560ad63c4f456f`
- 續工 checkpoint：`8c637ba0ae1cc30865fcd70ca3e415bd37664a3e`（施工前差異報告）
- Working branch：`work/2.7e-01-build-adapter-preflight`
- Final commit（最後程式／測試版本）：`fff8481deab1d6c217d83bd8909d086843d165b7`
- 本結果報告另以 docs-only commit 保存；以 `git log -1 --format=%H -- docs/Sewfunlife_site_WORK-2.7E-01_RESULT.md` 取得，完整報告提交 SHA 同步列於 Drive 交付副本。
- Stage Gate：**未宣告 Stage 2.7E PASS**。
- 未 merge main、未手動部署或發布 Production；既有 Vercel Git 整合自動嘗試 Preview，因缺 secrets 失敗（詳見下節）。

## 結論

Adapter、Schema／Terms 驗證、隱私投影、Course loader 與 workflow 接線已完成。59 項自動測試、lint、typecheck、合成 fixture 靜態建置與真實連接器快照靜態建置均通過。

真實 Sheet 快照成功輸出 **3 Courses＋5 Media**；2 Sessions、1 Instructor 因未公開而輸出 0 筆，FAQ 0 筆正常處理。

**尚未通過 Service Account 端到端 live integration。** 本機沒有三個指定的環境變數，未確認平台 Secrets 是否配置。連接器能讀 Sheet，不等於 Adapter 的 Service Account 授權與 GitHub Actions 已驗收。因此依原任務規定維持 PARTIAL / BLOCKED-LIVE-VERIFY。

手機／桌機瀏覽器視覺與互動 QA 亦未完成：Playwright 缺 Chromium，下載未成功。已完成靜態產物的課程、連結、封面、展示語意及隱私檢查；不將其宣稱為瀏覽器 QA。

## 原始阻擋與本輪授權修正

施工前依正式來源發現網站_Courses 定義 A:AF 共 32 欄，但 AG6、AG7 各有重複日期，無欄名／Schema 定義。先依任務停止並保存 `8c637ba`。

Owner 在本對話明確同意最小修正後：
- 重新讀取 AF4:AG7 的值、格式與驗證資訊。
- 只清空網站_Courses!AG6:AG7 的 userEnteredValue。
- 讀回確認兩格為空、AG 原日期格式保留、AF 正式日期與欄名完全未變。
- 其餘 Sheet、Schema、Terms、營運資料、分享權限均未修改。
- 修正後重新讀取 Courses，接續原任務。

此例外只涵蓋這兩格的已授權值清除，沒有擴張成 Sheet 整理或 Schema 改版。

## Required Sources 核對

已讀取最新 Control → Core v1.1 → Website Domain v0.2 → 指定 UI/Data Naming v0.1 → Rules → State → Decisions → Schema Review → 指定 Workbook 白名單資料 → GitHub 實際 main。

GitHub main 與派工基準一致；原始資料筆數與 99 個 Schema 欄位定義一致。未使用舊聊天摘要作為施工依據；未讀取非白名單工作表的資料內容。

## Implementation summary

### Adapter / validation

- `content:sync` 使用 RS256 Service Account JWT、Google OAuth 與 Sheets readonly scope。
- 只呼叫一次 values:batchGet，讀取七張明列網站白名單表；無整份 Workbook 資料讀取、無 Drive scope、無非網站表讀取。
- 範圍從第 4 列欄名起，涵蓋目前整個欄位網格，會拒絕無欄名卻有值的欄位。
- 網站_Schema 真正控制 field_key、繁中欄名、型別、required、visibility 與列表語意。
- 網站_Terms 真正提供核定繁中標籤 → system key；未確認／停用詞彙不能用作正式受控值，不以 aliases 作靜默備援。
- contract.json 僅斷言已鎖定的欄位契約，偵測刪欄、改型別、privacy 降級；沒有第二份中文 enum mapping。
- difficulty_level 按 Schema Review 的 integer 1–5 規格驗證，不捏造 Terms domain。
- 驗證 required、Boolean、Number／Integer、ISO 日期、ID／slug unique、FK、封存公開矛盾、媒體所有權及 Session 關聯。
- optional 空白輸出 null；trim 前後空白；只將 Schema 明示的 highlights 按全形分號拆成列表。
- 所有輸入列都先驗證，含草稿。

### Privacy / projection

- Schema.private 欄位不輸出。
- 另移除 build-only legacy_source／notes／privacy_note／material_fee_note。
- Media 需通過 published、privacy、usage 及公開父層條件。
- pending／private 媒體即使公開開關為是仍不輸出；Session 媒體依公開 Session 過濾。
- 講師照片透過 Instructor.photo_media_id 反向關聯，需公開講師引用才輸出。
- 指向被排除照片的 cover／photo reference 清空；備援只找已通過政策的公開 Course media。
- source_url／drive_folder_url／材料成本不作公開備援。
- 相對資產以 /work/ 或選用 ASSET_BASE_URL 解析，拒絕 traversal、非 HTTPS 外部網址及 URL credentials。

### Loader / UI migration

- generated 輸出固定為 courses／media／sessions／instructors／faq 五個 JSON。
- loader 直接讀 Course／Media，驗證 receipt 與 hash；無 projects.json／images.json fallback。
- Asset 只保留圖片呈現形狀，未反向建立 Portfolio Project／palette／typography／plates Source of Truth。
- 課程卡片、詳細頁、sitemap 直接消費新模型；保留現有 /work/<slug>/。
- 課程時間／難度由結構欄位呈現；internal 參與人數不主動顯示，沿用 public 人數補充。
- work_showcase 正確標示為作品展示；未冒充 Session 課程花絮。
- 未加入 Warm Theme／Lightbox／GA4／視覺改版。

### Build / secrets

- 正式順序：seed site → live content:sync → content:validate → next build。
- sync 在認證前移除舊 generated／receipt，任一步錯誤退出非零狀態。
- loader 與正式 build wrapper 也拒絕非 live receipt。
- 本機 fixture／snapshot 使用獨立明確指令；在 CI／Actions／Vercel／production 環境拒絕執行。
- receipt 存於 gitignored .cache，raw Terms／Schema 不輸出至 generated 或前端。
- seed 只保留 site.json，不再 seed 舊課程／圖片 JSON。
- Pages workflow 接入三個 secrets 名稱，以及 test／lint／typecheck；失敗不 upload／deploy。
- 沒有新增 Adapter 第三方 dependency，使用 Node 內建 crypto／fetch。
- 詳細維護方式見 `docs/BUILD-ADAPTER.md`。

## Tests executed + result

| 驗證 | 結果 |
| --- | --- |
| npm ci | PASS，安裝 375 packages |
| npm test | PASS，59/59 |
| npm run lint | PASS |
| npm run typecheck | PASS |
| npm run content:validate | PASS，connector-snapshot |
| npm run build:fixture | PASS，合成 3 Courses／5 Media |
| npm run build:snapshot -- 私人本機快照 | PASS，真實資料快照 3 Courses／5 Media |
| node tests/check-export.mjs | PASS，3 個課程頁、首頁連結、返回連結、封面及作品展示 |
| npm run build（無三個指定 secrets） | 預期 FAIL，exit 1，停在 content:sync，未執行 Next build |
| 非 live receipt 滿足 production | 正確拒絕 |
| Service Account 真實 live sync | BLOCKED，缺本機 credential |
| GitHub Actions 真實執行 | 未觸發／未驗收 |
| Vercel 自動 Preview | ERROR；缺三個指定 secrets，fail-fast 生效 |
| 瀏覽器手機／桌機 QA | 未驗證，缺 Chromium |

測試包含 duplicate 各模型 ID／slug、日期與數值錯誤、FK、缺欄、Schema privacy 降級、Terms 停用／未知值、禁止恢復 session_photo、未公開父層、隱私媒體排除、private 欄位注入、receipt 竄改、失敗清除舊結果、CI 拒絕 fixture，以及合成 JWT 簽名與七表限定讀取。測試只在記憶體產生合成 RSA key，沒有提交真實憑證。

重複本機 export 曾遇 Next out/work 清除錯誤 ENOTEMPTY；已在 build wrapper 編譯前清理可重建 out，之後 clean fixture 與快照建置均成功。

## 3 Courses / 5 Media live verification result

| 模型 | Sheet 原始筆數 | 快照輸出 | Service Account live |
| --- | ---: | ---: | --- |
| Courses | 3 | 3 | 未驗證 |
| Media | 5 | 5 | 未驗證 |
| Sessions | 2 | 0 | 未驗證 |
| Instructor | 1 | 0 | 未驗證 |
| FAQ | 0 | 0 | 未驗證 |

快照由已連接 Google Sheets 的唯讀工具取得；原始快照放 repo 外，未提交，也未輸出到 public/generated。

## Privacy evidence

- 合成 fixture 的 59 個靜態 HTML／RSC text／JSON／JS 檔掃描：私人標記、未公開講師標記與三個 private 欄位名稱均為 0 命中。
- 真實快照的 59 個靜態檔亦通過 private 欄位／標記掃描。
- generated JSON 的 private 欄位剔除由 unit tests 與 content:validate 檢查。
- 沒有輸出 private key／JSON credential／raw 私人快照。
- 這些證據不替代實際照片授權或未完成的 Service Account 驗收。

## Secrets wiring status

| 名稱 | YAML 接線 | 本機已配置 | GitHub repository Secrets |
| --- | --- | --- | --- |
| SEWFUNLIFE_SPREADSHEET_ID | 完成 | 否 | 未確認 |
| GOOGLE_SERVICE_ACCOUNT_EMAIL | 完成 | 否 | 未確認 |
| GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY | 完成 | 否 | 未確認 |

未變更平台 Secrets，未要求在聊天貼入敏感值。Vercel 等效環境設定與驗收尚未執行。

## Changed files

本輪程式／測試提交共 28 個檔案；另更新本結果 MD：

- `.github/workflows/nextjs.yml`
- `.gitignore`
- `app/page.tsx`
- `app/sitemap.ts`
- `app/work/[slug]/page.tsx`
- `components/ProjectCard.tsx`
- `docs/BUILD-ADAPTER.md`
- `docs/evidence/WORK-2.7E-01_checks.json`
- `docs/evidence/WORK-2.7E-01_export.json`
- `docs/evidence/WORK-2.7E-01_privacy.json`
- `docs/evidence/WORK-2.7E-01_tests.txt`
- `lib/content.ts`
- `lib/course-display.ts`
- `lib/course-types.ts`
- `lib/types.ts`
- `package.json`
- `scripts/build-local.mjs`
- `scripts/build-production.mjs`
- `scripts/content.mjs`
- `scripts/content/adapter.mjs`
- `scripts/content/contract.json`
- `scripts/content/google.mjs`
- `scripts/content/storage.mjs`
- `scripts/dev-prepare.mjs`
- `scripts/seed.mjs`
- `tests/adapter.test.mjs`
- `tests/check-export.mjs`
- `tests/fixtures/workbook.json`

## Blockers / Known risks / Deviations

1. 缺 Service Account 憑證，沒有完成原任務指定的 live sync／正式 pipeline 驗收；Vercel Preview 亦已由實際日誌確認缺少三個指定環境變數。
2. GitHub repository Secrets 配置與 Actions 執行未驗證；合併前必須處理，不能把本地 snapshot build 當作正式 build PASS。
3. 瀏覽器 QA 未完成；外部圖片實際載入、手機操作、RWD 與互動不得宣稱 PASS。
4. 現有 Framer URL、migration 1200×1200 及空白 ALT／文案仍按原範圍保留，未擴張素材搬遷。
5. 唯一 Sheet 修改是 Owner 額外明確核准的 AG6:AG7 清值。
6. 治理 Stage PASS 狀態未修改；由驗收 AI 讀真實分支與本報告後更新 Control／State／Pending Inputs。
7. 未大量匯入歷史課程、未改 ID／Workbook／正式 privacy 規則、未 merge 或手動發布 Production。

## Recommended next action

- 在安全的執行環境配置三個指定 secrets，確認 Service Account 僅對該 Workbook 具 Viewer 權限。
- 驗收 AI 讀本分支最新程式與本報告，執行真實 content:sync → validate → npm run build，確認 3／5／0／0／0 及 private 剔除。
- 補做可用瀏覽器的三個課程頁與手機／桌機檢查。
- 驗收後才決定是否 Stage 2.7E PASS、更新治理、建立合併／部署後續任務；本輪到隔離分支保存即停止。

## 提交後 Vercel 自動 Preview 讀回

使用 Vercel 部署檢查技能唯讀核對既有 Git 整合：

- 被檢查 commit：`a494db2de9f9d02ff4c4143985fd395e6d6f79f7`
- Deployment：`dpl_4zbdgZTsSpWv1uq1ioRdp5qfHsnd`
- Source：git；branch 為本隔離施工分支；target=null（非 Production）。
- 狀態：ERROR；`npm run build` exit 1。
- 日誌明確顯示缺少 SEWFUNLIFE_SPREADSHEET_ID、GOOGLE_SERVICE_ACCOUNT_EMAIL、GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY，停在 content:sync。
- [已檢查的 Vercel 建置紀錄](https://vercel.com/whynot-tws-projects/sewfunlife-github-io/4zbdgZTsSpWv1uq1ioRdp5qfHsnd)
- 這是既有 Git 自動 Preview，不是本輪手動部署；沒有停用整合、改平台設定或提供 fallback。
- 自動 Preview 的 fail-fast 已獲遠端證據，但仍不等於成功 live sync／部署驗收。
- 證據保存於 `docs/evidence/WORK-2.7E-01_vercel.json`，屬提交後新增的報告證據；不含憑證值。
