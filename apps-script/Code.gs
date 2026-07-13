/* ================================================================
   Paste this whole file into the Apps Script editor of a Google Sheet
   (Extensions > Apps Script), then Deploy > New deployment > Web app,
   with "Execute as: Me" and "Who has access: Anyone". Copy the
   resulting /exec URL into `submission.webAppUrl` in
   Experiment1-questions.js. See README.md for the full walkthrough.

   Each participant's browser POSTs one flat JSON object of
   { column_name: value } pairs (built by buildResultPayload() in the
   HTML). This script appends it as one row, creating the header row
   on the first submission and adding new columns automatically if you
   later add fields to the study config.
   ================================================================ */
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var keys = Object.keys(data);

  var lastCol = sheet.getLastColumn();
  var header = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

  if (header.length === 0) {
    sheet.appendRow(keys);
    header = keys.slice();
  } else {
    keys.forEach(function (k) {
      if (header.indexOf(k) === -1) {
        sheet.getRange(1, header.length + 1).setValue(k);
        header.push(k);
      }
    });
  }

  var row = header.map(function (k) {
    return data[k] !== undefined ? data[k] : '';
  });
  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
