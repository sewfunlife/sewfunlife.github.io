# WORK-2.7E-01｜Build Adapter 施工結果

- Task ID：WORK-2.7E-01
- Execution Status：**BLOCKED / SOURCE-CONTRACT-MISMATCH**
- 檢查日期：2026-10-22（Asia/Taipei）
- Base commit：`7ce7f3198a4f911e1f8deab91a560ad63c4f456f`
- Working branch：`work/2.7e-01-build-adapter-preflight`
- Final commit：本報告的提交；以 `git log -1 --format=%H -- docs/Sewfunlife_site_WORK-2.7E-01_RESULT.md` 取得，完整 SHA 另列於 Drive 同步交付紀錄。
- Changed files：僅 `docs/Sewfunlife_site_WORK-2.7E-01_RESULT.md`。
- Stage Gate：未判定；Stage 2.7E 實作尚未開始。

## 結論與停止依據

施工前發現正式 Sheet 與已鎖定欄位契約存在差異，因此依任務第 2 節、第 15 節與專案 Bootstrap 第 10 點停止施工，保存證據後回報。未自行清除 Sheet 儲存格，也未在 Adapter 中設計忽略未定義欄位的例外。

本報告是阻擋紀錄，不是 Adapter 完工報告。

## 已讀取的正式來源

按 Control 所列來源完成讀取：

1. Sewfunlife_site_00_PROJECT_CONTROL.md（2026-10-22 最新版）
2. Design_OS_Project_Working_Standard_v1.1.md
3. 01_網站與數位專案開發規範_v0.2.md
4. 00_介面語言與資料命名規範_v0.1.md（Control 指定版本）
5. Sewfunlife_site_PROJECT_RULES.md
6. Sewfunlife_site_PROJECT_STATE.md
7. Sewfunlife_site_DECISIONS.md
8. 布有趣｜Stage 2.7｜資料庫 Schema Review v0.1
9. 布有趣營運中心：只讀取 7 張網站白名單 Sheet 的資料
10. GitHub main 與本機 clone 的真實 HEAD

此外已讀取本次施工任務。未把舊聊天摘要作為施工依據。

## 已確認一致的基準

- GitHub main 與本機 HEAD 都是派工基準 `7ce7f3198a4f911e1f8deab91a560ad63c4f456f`。
- repo 尚無本任務 Adapter；`prebuild` 仍是 `npm run seed`。
- Control：Stage 2.7D PASS；下一步為本次 Stage 2.7E。
- 實際網站資料筆數：3 Courses、5 Media、2 Sessions、1 Instructor、0 FAQ。
- 2 Sessions 與 1 Instructor 均為「公開＝否」。
- Schema 實際有 99 個欄位定義。
- 未讀取營運、財務、客戶、庫存等非白名單工作表的資料內容；Workbook metadata 僅用於核對工作表名稱與範圍。

## 阻擋項目：無定義欄位卻有資料

Schema Review 第 10.4 節及網站_Schema 將網站_Courses 定義為 **32 欄（A:AF）**。

以 plain values 讀取後，再用 CellData 局部讀取 `AD4:AG7` 複核：

| 位置 | 正式欄名／定義 | 實際值 |
| --- | --- | --- |
| AF4 | 最後更新／updated_at | 最後更新 |
| AG4 | 無欄名、無 Schema 定義 | 空白 |
| AF6 | updated_at | 2026-09-06 |
| AG6 | 無定義 | 2026-09-06 |
| AF7 | updated_at | 2026-09-06 |
| AG7 | 無定義 | 2026-09-06 |

第 6、7 列都有 33 個位置的非空資料，第 33 欄沒有可映射的 field_key 或 visibility；不能自行決定其資料責任。

建議的最小處理是：經 Owner 明確授權並重新讀取後，僅清空 `網站_Courses!AG6:AG7` 的值，保留格式、驗證規則及 A:AF 內容。這是待核准建議，**本輪未執行**。

不得把「建議」誤讀為已確認這兩格可以刪除。

## 非阻擋觀察：difficulty_level

網站_Schema 的 difficulty_level 為 integer，controlled_vocab 填 difficulty_level；網站_Terms 沒有同名 domain。

Schema Review 第 8.2、10.8 節及 Sheet 本身 NUMBER_BETWEEN 驗證均明確定義為 1–5。因此已有數值範圍的正式依據，未把此項直接判為缺少 enum mapping，也未新增第二套中文 Terms 對照。

後續實作應依正式數值規格驗證 integer 1–5；不得憑空製造 Terms 列。

## Implementation summary

- 僅完成來源承接、基準核對、Sheet 契約差異複核與阻擋報告。
- 未建立 Adapter、generated loader 或 workflow 變更。
- 未修改 Sheet／Schema／Terms／治理文件。
- 未建立 generated JSON，也未以舊 JSON fallback 冒充正式驗證。

## Tests executed + result

| 項目 | 結果 |
| --- | --- |
| GitHub main／本機 HEAD 比對 | PASS，符合派工 SHA |
| 7 張白名單資料與 Schema 讀取 | 完成唯讀檢查 |
| AG6／AG7 局部 CellData 複核 | 確認存在契約外資料 |
| dependency install | NOT RUN，施工前停止 |
| lint／typecheck | NOT RUN，無程式變更 |
| Adapter unit／fixture／deterministic tests | NOT RUN，Adapter 未實作 |
| content:validate | NOT IMPLEMENTED / NOT RUN |
| npm run build | NOT RUN，無法作本任務完整 pipeline 驗收 |

## 3 Courses / 5 Media live verification

- 透過已連接 Google Sheets 的唯讀工具，確認上述原始資料筆數。
- **不等於 Service Account Adapter live integration PASS。**
- 真實 7 Sheet sync → normalized JSON → validation → Next.js build：尚未執行。
- Sessions／Instructor 未公開的 raw 值已核對；generated 過濾效果尚未實作或驗證。

## Privacy / private-field verification

- 沒有 generated public payload，因此 private-field 剔除測試尚未執行。
- 本報告沒有複製原始 private 欄位內容、完整 Workbook、講師草稿或非公開 Session 內容。
- 未取得、輸出或提交 private key／JSON credential。
- 未修改 Workbook 分享狀態。

## Production fail-fast verification

尚未實作或驗證；既有 Production pipeline 保持原狀。不得以此報告宣稱已具備新 Adapter fail-fast。

## Secrets wiring status

| 名稱 | 本輪狀態 |
| --- | --- |
| SEWFUNLIFE_SPREADSHEET_ID | 未接線；未確認 GitHub Secrets 是否已配置 |
| GOOGLE_SERVICE_ACCOUNT_EMAIL | 未接線；未確認 GitHub Secrets 是否已配置 |
| GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY | 未接線；未讀取或顯示值 |

目前執行環境沒有上述三個已命名環境變數。連接器可讀 Sheet 不表示本機或 GitHub Actions 已有 Service Account credential。

## Blockers / Deviations / Known risks

- Blocker：網站_Courses!AG6:AG7 存在未定義資料，需 Owner 決定。
- 停止原因為任務明定的正式來源差異處理規則；未擴張範圍修改 Sheet。
- 實作與全部工程驗證仍待完成，不可將本分支當成可部署 Candidate。
- 未 merge main、未部署、未宣告 Stage 2.7E PASS。
- 未修改 6MD；Control 已指向本任務及本結果固定路徑，後續驗收可循原入口讀取。

## Recommended next action

1. Owner 決定 AG6:AG7 的處理方式；若同意最小修正，只清值、不動正式 32 欄。
2. 修正後重新核對受影響 Sheet 與 repo HEAD。
3. 再承接原 WORK-2.7E-01，完成 Adapter、loader、workflow、測試。
4. 若沒有唯讀 Service Account credential，按任務規範以 PARTIAL / BLOCKED-LIVE-VERIFY 回報，不宣稱 live integration PASS。
