/**
 * EMR-DAS Referral Game — Google Sheets Score Bridge
 * Deploy as a Web App (execute as: Me; who has access: Anyone).
 * POST any JSON with at least {fullName, score, total} and it appends a
 * timestamped row to the "Scores" sheet of your fixed workbook.
 */

var SPREADSHEET_ID = "1PMR86sgmdW889v0YdvJDy55jKwj-VfG1-pJ7s3iGUzw";
var SHEET_NAME = "Scores";
var HEADERS = [
  "Timestamp",
  "Player Name",
  "Profession",
  "Level",
  "Score",
  "Total",
  "Percentage",
  "Streak",
];

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight("bold")
        .setBackground("#0f172a")
        .setFontColor("#38bdf8");
      sheet.setFrozenRows(1);
    }

    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      new Date(),
      data.fullName || "Anonymous Operator",
      data.profession || "",
      data.levelName || "",
      Number(data.score) || 0,
      Number(data.total) || 0,
      (Number(data.percentage) || 0).toFixed(0) + "%",
      Number(data.streak) || 0,
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ result: "success" }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: "error", message: String(err) }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
