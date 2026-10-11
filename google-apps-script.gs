/**
 * Ghosted Waitlist → Google Sheets
 * Spreadsheet: https://docs.google.com/spreadsheets/d/1-6xNrx36wK9gh7UrYDMvKqRXJBP7_HzQpTSOquvMY9U
 */

const SPREADSHEET_ID = "1-6xNrx36wK9gh7UrYDMvKqRXJBP7_HzQpTSOquvMY9U";
const SHEET_NAME = "Waitlist";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet_();

    sheet.appendRow([
      data.createdAt || new Date().toISOString(),
      data.contactType || "",
      data.instagram || "",
      data.email || "",
      data.source || "ghosted-waitlist",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(
    "Ghosted waitlist endpoint is live."
  );
}

function getOrCreateSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "Timestamp",
      "Contact Type",
      "Instagram",
      "Email",
      "Source",
    ]);
  }

  return sheet;
}
