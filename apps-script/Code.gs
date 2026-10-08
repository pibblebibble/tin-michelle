/**
 * Tin & Michelle RSVP: saves each response as a row in this Google Sheet.
 * It sends no email. Setup steps are in README.md.
 */

const RESPONSES = 'Responses';
const SUMMARY = 'Summary';
const HEADERS = ['Received', 'Name', 'Attending', 'Plus-one', 'Plus-one name', 'Dietary', 'WhatsApp', 'Email', 'Message'];
const EMAIL_COL = 8;

/** Run once from the editor: builds the two tabs. Safe to run again. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let responses = ss.getSheetByName(RESPONSES);
  if (!responses) responses = ss.insertSheet(RESPONSES, 0);
  responses.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
  responses.setFrozenRows(1);

  let summary = ss.getSheetByName(SUMMARY);
  if (!summary) summary = ss.insertSheet(SUMMARY, 1);
  summary.getRange('A1:B5').setValues([
    ['Guests attending', '=COUNTIF(Responses!C2:C,"Yes")'],
    ['Plus-ones', '=COUNTIFS(Responses!C2:C,"Yes",Responses!D2:D,"Yes")'],
    ['Total headcount', '=B1+B2'],
    ['Declined', '=COUNTIF(Responses!C2:C,"No")'],
    ['Responses received', '=COUNTA(Responses!B2:B)']
  ]);
  summary.getRange('A1:A5').setFontWeight('bold');
  summary.autoResizeColumn(1);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const data = JSON.parse(e.postData.contents);

    const attending = data.attending === 'Yes' ? 'Yes' : data.attending === 'No' ? 'No' : '';
    const name = clean(data.name);
    const email = clean(data.email).toLowerCase();
    if (!attending || !name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ ok: false, error: 'Missing required fields' });
    }

    const coming = attending === 'Yes';
    const bringing = coming && data.plusOne === 'Yes';
    const row = [
      new Date(),
      name,
      attending,
      coming ? (bringing ? 'Yes' : 'No') : '',
      bringing ? clean(data.plusOneName) : '',
      coming ? clean(data.dietary) : '',
      clean(data.phone),
      email,
      clean(data.message)
    ].map(safeCell);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(RESPONSES);
    // A guest who responds again with the same email updates their row instead of adding a second one.
    const existing = findRowByEmail(sheet, email);
    if (existing) {
      sheet.getRange(existing, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, error: 'Could not save' });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true });
}

function findRowByEmail(sheet, email) {
  const last = sheet.getLastRow();
  if (last < 2) return 0;
  const emails = sheet.getRange(2, EMAIL_COL, last - 1, 1).getValues();
  for (let i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).toLowerCase() === email) return i + 2;
  }
  return 0;
}

function clean(value) {
  return String(value == null ? '' : value).trim().slice(0, 1000);
}

/** Stops a typed "=..." or "+60..." being read by Sheets as a formula. */
function safeCell(value) {
  return typeof value === 'string' && /^[=+\-@]/.test(value) ? "'" + value : value;
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
