const SHEET_NAME = "beena_sync";
const HEADER = ["team_id", "updated_at", "payload_json"];

function doGet(e) {
  return jsonResponse_(loadSnapshot_(getTeamId_(e)));
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData && e.postData.contents ? e.postData.contents : "{}");
    const teamId = getTeamId_(payload);
    const state = sanitizeState_(payload.state || {});
    const updatedAt = payload.updatedAt || new Date().toISOString();

    saveSnapshot_(teamId, updatedAt, state);

    return jsonResponse_({
      ok: true,
      teamId,
      updatedAt
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error.message || String(error)
    });
  }
}

function loadSnapshot_(teamId) {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();

  for (let index = 1; index < rows.length; index += 1) {
    const [rowTeamId, updatedAt, payload] = rows[index];
    if (rowTeamId === teamId) {
      return {
        ok: true,
        teamId,
        updatedAt: updatedAt || "",
        state: payload ? JSON.parse(payload) : null
      };
    }
  }

  return {
    ok: true,
    teamId,
    updatedAt: "",
    state: null
  };
}

function saveSnapshot_(teamId, updatedAt, state) {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  const json = JSON.stringify(state);

  for (let index = 1; index < rows.length; index += 1) {
    if (rows[index][0] === teamId) {
      sheet.getRange(index + 1, 1, 1, HEADER.length).setValues([[teamId, updatedAt, json]]);
      return;
    }
  }

  sheet.appendRow([teamId, updatedAt, json]);
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADER.length).setValues([HEADER]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getTeamId_(source) {
  const teamId = source && source.teamId ? String(source.teamId).trim() : "beena";
  return teamId || "beena";
}

function sanitizeState_(state) {
  return {
    players: Array.isArray(state.players) ? state.players : [],
    attendance: state.attendance && typeof state.attendance === "object" ? state.attendance : {},
    lineups: state.lineups && typeof state.lineups === "object" ? state.lineups : {},
    fixtures: Array.isArray(state.fixtures) ? state.fixtures : []
  };
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
