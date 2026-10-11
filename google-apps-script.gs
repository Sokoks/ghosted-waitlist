/**
 * Ghosted Waitlist → Google Sheets
 *
 * SETUP:
 * 1. Otvori Google Sheets i napravi novu tablicu (npr. "Ghosted Waitlist")
 * 2. U prvi red stavi zaglavlja:
 *    Timestamp | Contact Type | Instagram | Email | Source
 * 3. Extensions → Apps Script
 * 4. Obriši defaultni kod i zalijepi OVAJ cijeli fajl
 * 5. Spremi projekt
 * 6. Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 7. Kopiraj Web App URL i zalijepi ga u config.js kao googleScriptUrl
 */

const SHEET_NAME = "Waitlist"; // ili ime tvog lista/sheeta

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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
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
