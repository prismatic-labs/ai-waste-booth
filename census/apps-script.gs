// AI Waste Receipt — census collector
// Paste this entire file into Google Apps Script, then follow SETUP.md

function doPost(e) {
  try {
    const sheet = _getSheet();
    const d = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      d.isBuilder ? "Builder" : "Casual",
      d.archetype        || "",
      d.suspectedPattern || "",
      d.useCase          || "",
      d.id               || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, err: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Adds headers on first run, returns the sheet
function _getSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Responses") || ss.getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp", "Type", "Archetype", "Pattern", "Use Case", "ID"]);
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(5, 280);
  }

  return sheet;
}

// Run this manually in the editor to see a live tally in the logs
function logTally() {
  const sheet = _getSheet();
  const rows  = sheet.getDataRange().getValues().slice(1);
  const tally = {};

  rows.forEach(row => {
    const key = row[2] || row[3] || "unknown";
    tally[key] = (tally[key] || 0) + 1;
  });

  Logger.log("Total responses: " + rows.length);
  Logger.log(JSON.stringify(tally, null, 2));
}
