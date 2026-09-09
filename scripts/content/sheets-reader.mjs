import process from "node:process";
import { getGoogleAccessToken } from "./google-auth.mjs";

const SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

export const SHEET_WHITELIST = Object.freeze({
  網站_Courses: "'網站_Courses'!A:AN",
  網站_Media: "'網站_Media'!A:X",
  網站_Sessions: "'網站_Sessions'!A:T",
  網站_Instructor: "'網站_Instructor'!A:T",
  網站_FAQ: "'網站_FAQ'!A:L",
  網站_Terms: "'網站_Terms'!A:N",
  網站_Schema: "'網站_Schema'!A:P",
});

const HEADER_ROW_NUMBER = 4;
const HEADER_ROW_INDEX = HEADER_ROW_NUMBER - 1;

function requiredSpreadsheetId() {
  const value = process.env.SEWFUNLIFE_SPREADSHEET_ID;
  if (!value || !value.trim()) {
    throw new Error(
      "[content:reader] Missing required environment variable: SEWFUNLIFE_SPREADSHEET_ID",
    );
  }
  return value.trim();
}

function isEmptyRow(row) {
  return !row?.some((cell) => String(cell ?? "").trim() !== "");
}

async function fetchSheetValues({ spreadsheetId, accessToken, sheetName, range }) {
  if (!Object.hasOwn(SHEET_WHITELIST, sheetName)) {
    throw new Error(`[content:reader] Refusing non-whitelisted sheet: ${sheetName}`);
  }

  const endpoint =
    `${SHEETS_API_BASE}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}` +
    "?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING";

  const response = await fetch(endpoint, {
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `[content:reader] Failed to read ${sheetName} (${response.status}): ${detail}`,
    );
  }

  const result = await response.json();
  const values = Array.isArray(result.values) ? result.values : [];
  const headers = values[HEADER_ROW_INDEX] ?? [];

  if (headers.length === 0 || isEmptyRow(headers)) {
    throw new Error(
      `[content:reader] ${sheetName} is missing its header row at row ${HEADER_ROW_NUMBER}.`,
    );
  }

  return {
    sheetName,
    range: result.range ?? range,
    headerRow: HEADER_ROW_NUMBER,
    headers,
    rows: values.slice(HEADER_ROW_NUMBER).filter((row) => !isEmptyRow(row)),
  };
}

export async function readWhitelistedSheets() {
  const spreadsheetId = requiredSpreadsheetId();
  const accessToken = await getGoogleAccessToken();
  const result = {};

  for (const [sheetName, range] of Object.entries(SHEET_WHITELIST)) {
    result[sheetName] = await fetchSheetValues({
      spreadsheetId,
      accessToken,
      sheetName,
      range,
    });
  }

  return result;
}

export function buildReadSummary(sheets) {
  return Object.fromEntries(
    Object.entries(sheets).map(([sheetName, sheet]) => [
      sheetName,
      {
        rows: sheet.rows.length,
        columns: sheet.headers.length,
        headerRow: sheet.headerRow,
      },
    ]),
  );
}

async function main() {
  const sheets = await readWhitelistedSheets();
  console.log(JSON.stringify(buildReadSummary(sheets), null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
