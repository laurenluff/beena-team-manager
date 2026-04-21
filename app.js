const storageKey = "footy-team-manager-v1";
const attendanceKey = "footy-team-round-attendance-v1";
const lineupsKey = "footy-team-lineups-v1";
const lineupNameModeKey = "footy-team-lineup-name-mode-v1";
const rosterKey = "footy-team-roster-2026-v1";
const roundCount = 16;
const sessions = ["monday", "thursday", "game"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sessionLabels = {
  monday: "Monday Training",
  thursday: "Thursday Training",
  game: "Game Day Availability",
  lineup: "Starting Lineup"
};
const lineupTemplateSpots = [
  { id: "fb-1", x: 35.4, y: 23.8, w: 12.5, h: 5.9 },
  { id: "fb-2", x: 58, y: 23.8, w: 12.5, h: 5.9 },
  { id: "hb-1", x: 24.8, y: 35, w: 12.5, h: 5.9 },
  { id: "hb-2", x: 46.1, y: 35, w: 12.5, h: 5.9 },
  { id: "hb-3", x: 66.7, y: 35, w: 12.5, h: 5.9 },
  { id: "c-wing-left", x: 21.5, y: 51.5, w: 12.5, h: 5.9 },
  { id: "c-mid-1", x: 39, y: 47.5, w: 12.5, h: 5.9 },
  { id: "c-mid-2", x: 53.5, y: 47.5, w: 12.5, h: 5.9 },
  { id: "c-mid-3", x: 39, y: 55.8, w: 12.5, h: 5.9 },
  { id: "c-mid-4", x: 53.5, y: 55.8, w: 12.5, h: 5.9 },
  { id: "c-wing-right", x: 72.8, y: 51.5, w: 12.5, h: 5.9 },
  { id: "hf-1", x: 25.8, y: 68.7, w: 12.5, h: 5.9 },
  { id: "hf-2", x: 46.5, y: 68.7, w: 12.5, h: 5.9 },
  { id: "hf-3", x: 67.8, y: 68.7, w: 12.5, h: 5.9 },
  { id: "ff-1", x: 34.7, y: 79.8, w: 12.5, h: 5.9 },
  { id: "ff-2", x: 57.3, y: 79.8, w: 12.5, h: 5.9 },
  { id: "interchange-1", x: 92.1, y: 37.6, w: 12.5, h: 5.9 },
  { id: "interchange-2", x: 92.1, y: 44, w: 12.5, h: 5.9 },
  { id: "interchange-3", x: 92.1, y: 50.4, w: 12.5, h: 5.9 },
  { id: "interchange-4", x: 92.1, y: 56.8, w: 12.5, h: 5.9 },
  { id: "interchange-5", x: 92.1, y: 63.2, w: 12.5, h: 5.9 },
  { id: "interchange-6", x: 92.1, y: 69.6, w: 12.5, h: 5.9 },
  { id: "emergency-1", x: 92.1, y: 82, w: 12.5, h: 5.9 },
  { id: "emergency-2", x: 92.1, y: 88.6, w: 12.5, h: 5.9 }
];

let players = loadPlayers();
let attendance = loadAttendance();
let lineups = loadLineups();
let selectedRound = 1;
let selectedSession = "monday";
let selectedLineupPlayerId = null;
let lineupNameMode = localStorage.getItem(lineupNameModeKey) || "full";

const form = document.querySelector("#playerForm");
const playerGrid = document.querySelector("#playerGrid");
const playerTemplate = document.querySelector("#playerButtonTemplate");
const emptyState = document.querySelector("#emptyState");
const searchInput = document.querySelector("#searchInput");
const roundButtons = document.querySelector("#roundButtons");
const sessionButtons = document.querySelectorAll("[data-session]");
const roundTable = document.querySelector("#roundTable");
const seasonTable = document.querySelector("#seasonTable");
const attendanceTools = document.querySelector("#attendanceTools");
const lineupView = document.querySelector("#lineupView");
const lineupPlayerList = document.querySelector("#lineupPlayerList");
const lineupOval = document.querySelector("#lineupOval");
const clearLineupButton = document.querySelector("#clearLineup");
const lineupNameModeButtons = document.querySelectorAll("[data-lineup-name-mode]");
const openPlayerModal = document.querySelector("#openPlayerModal");
const closePlayerModal = document.querySelector("#closePlayerModal");
const playerModal = document.querySelector("#playerModal");
const crmList = document.querySelector("#crmList");
const micButton = document.querySelector("#micButton");
const voiceStatus = document.querySelector("#voiceStatus");
const voiceTranscript = document.querySelector("#voiceTranscript");
const loginForm = document.querySelector("#loginForm");
const emailInput = document.querySelector("#emailInput");
const signOutButton = document.querySelector("#signOutButton");
const syncTitle = document.querySelector("#syncTitle");
const syncStatus = document.querySelector("#syncStatus");
const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
const supabaseSettings = globalThis.FOOTY_SUPABASE || {};
const teamId = supabaseSettings.teamId || "beena";
const hasCloudSettings = Boolean(supabaseSettings.url && supabaseSettings.anonKey && teamId);
const cloudClient = hasCloudSettings && globalThis.supabase
  ? globalThis.supabase.createClient(supabaseSettings.url, supabaseSettings.anonKey)
  : null;

let recognition = null;
let listening = false;
let currentUser = null;
let cloudNicknameColumnAvailable = true;

const rosterNames = [
  "Alice Allet",
  "Annemarie Yap",
  "Ash Bertagno",
  "Ava Simpson",
  "Charlotte Trewarn",
  "Chloe Cranage",
  "Daisy Gee",
  "Ellen Block",
  "Ellie Michael",
  "Ellie Stratikopoulos",
  "Ellie Owen",
  "Ellie Dempsey",
  "Emily Sainty",
  "Hailey Jean",
  "Hannah Johnson",
  "Heidi Parkinson",
  "Jess Baguley",
  "Kat Rosendorf",
  "Laura Stanley",
  "Lavinia Falvo",
  "Lexi Ryan",
  "Lily Brown",
  "Mia Fortune",
  "Pauli Tragarz",
  "Racquel Luntz",
  "Tanisha Binios",
  "Tiani Wiropuspito",
  "Kiara Field",
  "Lauren Arthur",
  "Rianne Darvell",
  "Peggy (PJ) Martin"
];

const samplePlayerNames = new Set(["Tom Harris", "Lachie Moore", "Noah Kelly"]);
const defaultPlayers = rosterNames.map(createRosterPlayer);

if (!players.length) {
  players = defaultPlayers;
  savePlayers();
}

mergeRoster();
normalizeAttendance();
normalizeLineups();
renderLineupSpots();
renderRoundButtons();
render();

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const player = {
    id: makeId(),
    name: formData.get("name").trim(),
    nickname: formData.get("nickname").trim(),
    number: formData.get("number").trim(),
    position: formData.get("position"),
    status: "Available",
    notes: formData.get("notes").trim(),
    training: false,
    match: false
  };

  if (!player.name) return;

  players.push(player);
  savePlayers();
  await upsertCloudPlayers([player]);
  form.reset();
  document.querySelector("#nameInput").focus();
  playerModal.close();
  render();
});

document.querySelector("#clearForm").addEventListener("click", () => {
  form.reset();
  document.querySelector("#nameInput").focus();
});

searchInput.addEventListener("input", renderPlayerGrid);

openPlayerModal.addEventListener("click", () => {
  renderCrmList();
  playerModal.showModal();
  document.querySelector("#nameInput").focus();
});

closePlayerModal.addEventListener("click", () => {
  playerModal.close();
});

playerModal.addEventListener("click", (event) => {
  if (event.target === playerModal) {
    playerModal.close();
  }
});

clearLineupButton.addEventListener("click", () => {
  lineups[String(selectedRound)] = {};
  selectedLineupPlayerId = null;
  saveLineups();
  deleteCloudLineupRound(selectedRound);
  renderLineup();
});

lineupNameModeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    lineupNameMode = button.dataset.lineupNameMode;
    localStorage.setItem(lineupNameModeKey, lineupNameMode);
    renderLineup();
  });
});

sessionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedSession = button.dataset.session;
    sessionButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    render();
  });
});

document.querySelector("#exportCsv").addEventListener("click", exportCsv);
document.querySelector("#importCsv").addEventListener("change", importCsv);
setupVoiceRecognition();
setupCloudSync();

function loadPlayers() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
}

function savePlayers() {
  localStorage.setItem(storageKey, JSON.stringify(players));
}

function loadAttendance() {
  try {
    return JSON.parse(localStorage.getItem(attendanceKey)) || {};
  } catch {
    return {};
  }
}

function loadLineups() {
  try {
    return JSON.parse(localStorage.getItem(lineupsKey)) || {};
  } catch {
    return {};
  }
}

function saveAttendance() {
  localStorage.setItem(attendanceKey, JSON.stringify(attendance));
}

function saveLineups() {
  localStorage.setItem(lineupsKey, JSON.stringify(lineups));
}

function makeId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (character) =>
    (Number(character) ^ Math.random() * 16 >> Number(character) / 4).toString(16)
  );
}

function createRosterPlayer(name) {
  return {
    id: makeId(),
    name,
    nickname: name.match(/\((.*?)\)/)?.[1] || "",
    number: "",
    position: "Utility",
    status: "Available",
    notes: "",
    training: false,
    match: false
  };
}

function mergeRoster() {
  if (localStorage.getItem(rosterKey)) return;

  const existingNames = new Set(players.map((player) => player.name.toLowerCase()));
  const rosterPlayers = rosterNames
    .filter((name) => !existingNames.has(name.toLowerCase()))
    .map(createRosterPlayer);

  players = players
    .filter((player) => !samplePlayerNames.has(player.name))
    .concat(rosterPlayers);
  savePlayers();
  localStorage.setItem(rosterKey, "true");
}

function normalizeAttendance() {
  for (let round = 1; round <= roundCount; round += 1) {
    const key = String(round);
    attendance[key] ||= {};
    sessions.forEach((session) => {
      attendance[key][session] ||= [];
    });
  }
  saveAttendance();
}

function normalizeLineups() {
  const validSpotIds = new Set(getLineupSpotIds());
  for (let round = 1; round <= roundCount; round += 1) {
    const roundKey = String(round);
    lineups[roundKey] ||= {};
    Object.keys(lineups[roundKey]).forEach((spotId) => {
      if (!validSpotIds.has(spotId)) {
        delete lineups[roundKey][spotId];
      }
    });
  }
  saveLineups();
}

function getLineupSpotIds() {
  return lineupTemplateSpots.map((spot) => spot.id);
}

function renderLineupSpots() {
  lineupOval.replaceChildren();
  lineupTemplateSpots.forEach((templateSpot) => {
    const spot = document.createElement("button");
    spot.type = "button";
    spot.className = "lineup-spot";
    spot.dataset.spotId = templateSpot.id;
    spot.style.left = `${templateSpot.x}%`;
    spot.style.top = `${templateSpot.y}%`;
    spot.style.width = `${templateSpot.w}%`;
    spot.style.height = `${templateSpot.h}%`;
    spot.addEventListener("dragover", (event) => event.preventDefault());
    spot.addEventListener("drop", handleLineupDrop);
    spot.addEventListener("click", () => handleLineupSpotClick(spot.dataset.spotId));
    spot.addEventListener("dragstart", handleLineupSpotDragStart);
    lineupOval.append(spot);
  });
}

function renderRoundButtons() {
  roundButtons.replaceChildren();

  for (let round = 1; round <= roundCount; round += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = round;
    button.classList.toggle("is-active", round === selectedRound);
    button.setAttribute("aria-label", `Round ${round}`);
    button.addEventListener("click", () => {
      selectedRound = round;
      selectedLineupPlayerId = null;
      renderRoundButtons();
      render();
    });
    roundButtons.append(button);
  }
}

function render() {
  document.querySelector("#roundTitle").textContent = `Round ${selectedRound}`;
  document.querySelector("#modeEyebrow").textContent = selectedSession === "lineup" ? "Starting 16" : "Mark Attendance";
  document.querySelector("#sessionTitle").textContent = sessionLabels[selectedSession];
  document.querySelector("#roundTableTitle").textContent = `Round ${selectedRound} Table`;
  renderMode();
  renderRoundTable();
  renderSeasonTable();
  updateSummary();
}

function renderMode() {
  const lineupMode = selectedSession === "lineup";
  attendanceTools.hidden = lineupMode;
  playerGrid.hidden = lineupMode;
  lineupView.hidden = !lineupMode;
  emptyState.hidden = lineupMode;

  if (lineupMode) {
    renderLineup();
  } else {
    renderPlayerGrid();
  }
}

function renderPlayerGrid() {
  const query = searchInput.value.trim().toLowerCase();
  const filteredPlayers = sortedPlayers().filter((player) => {
    const searchable = `${player.name} ${player.nickname || ""} ${player.number} ${player.position} ${player.notes}`.toLowerCase();
    return searchable.includes(query);
  });

  playerGrid.replaceChildren();

  filteredPlayers.forEach((player) => {
    const button = playerTemplate.content.firstElementChild.cloneNode(true);
    const selected = hasAttendance(player.id, selectedRound, selectedSession);

    button.classList.toggle("is-selected", selected);
    button.querySelector(".guernsey").textContent = player.number || "";
    button.querySelector(".player-name").textContent = player.name;
    button.querySelector(".player-meta").textContent = player.notes || player.position || "Utility";
    button.addEventListener("click", () => {
      toggleAttendance(player.id, selectedRound, selectedSession);
    });
    playerGrid.append(button);
  });

  emptyState.classList.toggle("is-visible", filteredPlayers.length === 0);
}

function renderLineup() {
  const roundLineup = lineups[String(selectedRound)] || {};
  const usedPlayerIds = new Set(Object.values(roundLineup).filter(Boolean));
  const gameAvailableIds = new Set(attendance[String(selectedRound)]?.game || []);

  getLineupSpotIds().forEach((spotId) => {
    const spot = document.querySelector(`[data-spot-id="${spotId}"]`);
    const player = players.find((item) => item.id === roundLineup[spotId]);
    spot.classList.toggle("has-player", Boolean(player));
    spot.replaceChildren();
    if (player) {
      getLineupGroundNameLines(player).forEach((line) => {
        const nameLine = document.createElement("span");
        nameLine.className = "lineup-name-line";
        nameLine.textContent = line.toUpperCase();
        spot.append(nameLine);
      });
    }
    spot.title = player ? "Click to remove from lineup" : "Drop a player here";
    spot.draggable = Boolean(player);
    spot.dataset.playerId = player?.id || "";
  });

  lineupPlayerList.replaceChildren();
  lineupNameModeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lineupNameMode === lineupNameMode);
  });

  sortedPlayers()
    .filter((player) => gameAvailableIds.has(player.id) && !usedPlayerIds.has(player.id))
    .forEach((player) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "lineup-player-chip";
      chip.classList.toggle("is-picked", selectedLineupPlayerId === player.id);
      chip.draggable = true;
      chip.dataset.playerId = player.id;
      chip.textContent = getLineupDisplayName(player);
      chip.addEventListener("dragstart", handleLineupPlayerDragStart);
      chip.addEventListener("click", () => {
        selectedLineupPlayerId = selectedLineupPlayerId === player.id ? null : player.id;
        renderLineup();
      });
      lineupPlayerList.append(chip);
    });
}

function getLineupDisplayName(player) {
  if (lineupNameMode === "nickname" && player.nickname) {
    return player.nickname;
  }
  return player.name;
}

function getLineupGroundNameLines(player) {
  if (lineupNameMode === "nickname" && player.nickname) {
    return [player.nickname];
  }

  const cleanName = player.name.replace(/\((.*?)\)/g, "").replace(/\s+/g, " ").trim();
  const [firstName, ...rest] = cleanName.split(" ");
  return [firstName, rest.join(" ")].filter(Boolean);
}

function handleLineupPlayerDragStart(event) {
  event.dataTransfer.setData("text/plain", event.currentTarget.dataset.playerId);
}

function handleLineupSpotDragStart(event) {
  const playerId = event.currentTarget.dataset.playerId;
  if (playerId) {
    event.dataTransfer.setData("text/plain", playerId);
  }
}

function handleLineupDrop(event) {
  event.preventDefault();
  const playerId = event.dataTransfer.getData("text/plain");
  const spotId = event.currentTarget.dataset.spotId;

  if (!playerId || !spotId) return;

  assignLineupPlayer(playerId, spotId);
}

async function assignLineupPlayer(playerId, spotId) {
  const roundLineup = lineups[String(selectedRound)];

  Object.keys(roundLineup).forEach((key) => {
    if (roundLineup[key] === playerId) {
      delete roundLineup[key];
    }
  });

  roundLineup[spotId] = playerId;
  selectedLineupPlayerId = null;
  saveLineups();
  await upsertCloudLineups([{ round: selectedRound, spotId, playerId }]);
  renderLineup();
}

function handleLineupSpotClick(spotId) {
  if (selectedLineupPlayerId) {
    assignLineupPlayer(selectedLineupPlayerId, spotId);
  } else {
    removeLineupPlayer(spotId);
  }
}

async function removeLineupPlayer(spotId) {
  const roundLineup = lineups[String(selectedRound)];
  if (!roundLineup[spotId]) return;
  delete roundLineup[spotId];
  saveLineups();
  await deleteCloudLineupSpot(selectedRound, spotId);
  renderLineup();
}

function renderCrmList() {
  crmList.replaceChildren();

  sortedPlayers().forEach((player) => {
    const row = document.createElement("div");
    row.className = "crm-row";

    const nameInput = crmInput("Name", player.name);
    const nicknameInput = crmInput("Nickname", player.nickname || "");
    const numberInput = crmInput("No.", player.number || "");
    const positionSelect = crmSelect("Position", ["Utility", "Forward", "Midfield", "Back", "Ruck"], player.position || "Utility");
    const statusSelect = crmSelect("Status", ["Available", "Managed", "Injured", "Unavailable"], player.status || "Available");
    const notesInput = crmInput("Injury / notes", player.notes || "");
    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.textContent = "×";
    deleteButton.title = "Remove player";
    deleteButton.addEventListener("click", () => deletePlayer(player.id));

    [nameInput, nicknameInput, numberInput, positionSelect, statusSelect, notesInput].forEach((input) => {
      input.addEventListener("change", () => {
        updatePlayerDetails(player.id, {
          name: nameInput.value.trim(),
          nickname: nicknameInput.value.trim(),
          number: numberInput.value.trim(),
          position: positionSelect.value,
          status: statusSelect.value,
          notes: notesInput.value.trim()
        });
      });
    });

    row.append(nameInput, nicknameInput, numberInput, positionSelect, statusSelect, notesInput, deleteButton);
    crmList.append(row);
  });
}

function crmInput(label, value) {
  const input = document.createElement("input");
  input.value = value;
  input.setAttribute("aria-label", label);
  input.placeholder = label;
  return input;
}

function crmSelect(label, options, value) {
  const select = document.createElement("select");
  select.setAttribute("aria-label", label);

  options.forEach((optionValue) => {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue;
    select.append(option);
  });

  select.value = value;
  return select;
}

async function updatePlayerDetails(playerId, patch) {
  if (!patch.name) return;

  players = players.map((player) => (player.id === playerId ? { ...player, ...patch } : player));
  savePlayers();
  await upsertCloudPlayers(players.filter((player) => player.id === playerId));
  render();
}

async function deletePlayer(playerId) {
  players = players.filter((player) => player.id !== playerId);

  for (let round = 1; round <= roundCount; round += 1) {
    sessions.forEach((session) => {
      attendance[String(round)][session] = attendance[String(round)][session].filter((id) => id !== playerId);
    });

    Object.keys(lineups[String(round)] || {}).forEach((spotId) => {
      if (lineups[String(round)][spotId] === playerId) {
        delete lineups[String(round)][spotId];
      }
    });
  }

  savePlayers();
  saveAttendance();
  saveLineups();
  await deleteCloudPlayer(playerId);
  renderCrmList();
  render();
}

function renderRoundTable() {
  roundTable.replaceChildren();

  sortedPlayers().forEach((player) => {
    const row = document.createElement("tr");
    row.append(
      tableCell(player.name, "Player"),
      markCell(hasAttendance(player.id, selectedRound, "monday"), "Monday"),
      markCell(hasAttendance(player.id, selectedRound, "thursday"), "Thursday"),
      markCell(hasAttendance(player.id, selectedRound, "game"), "Game Day"),
      tableCell(player.notes || "", "Notes")
    );
    roundTable.append(row);
  });
}

function renderSeasonTable() {
  seasonTable.replaceChildren();

  sortedPlayers().forEach((player) => {
    const totals = getSeasonTotals(player.id);
    const row = document.createElement("tr");
    row.append(
      tableCell(player.name, "Player"),
      tableCell(totals.monday, "Mon"),
      tableCell(totals.thursday, "Thu"),
      tableCell(totals.game, "Game"),
      tableCell(totals.total, "Total")
    );
    seasonTable.append(row);
  });
}

function tableCell(value, label) {
  const cell = document.createElement("td");
  cell.dataset.label = label;
  cell.textContent = value;
  return cell;
}

function markCell(selected, label) {
  const cell = tableCell(selected ? "Yes" : "", label);
  cell.classList.toggle("is-yes", selected);
  return cell;
}

function sortedPlayers() {
  return [...players].sort((a, b) => a.name.localeCompare(b.name));
}

function hasAttendance(playerId, round, session) {
  return attendance[String(round)]?.[session]?.includes(playerId) || false;
}

async function toggleAttendance(playerId, round, session) {
  const list = attendance[String(round)][session];
  const existingIndex = list.indexOf(playerId);

  if (existingIndex >= 0) {
    list.splice(existingIndex, 1);
    await deleteCloudAttendance(playerId, round, session);
  } else {
    list.push(playerId);
    await upsertCloudAttendance([{ playerId, round, session }]);
  }

  saveAttendance();
  render();
}

function markAttendance(playerId, round, session) {
  const list = attendance[String(round)][session];
  if (!list.includes(playerId)) {
    list.push(playerId);
    saveAttendance();
    return true;
  }
  return false;
}

function setupVoiceRecognition() {
  if (!SpeechRecognition) {
    micButton.disabled = true;
    voiceStatus.textContent = "Voice input is not available in this browser.";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "en-AU";
  recognition.continuous = true;
  recognition.interimResults = false;

  micButton.addEventListener("click", () => {
    if (listening) {
      recognition.stop();
    } else {
      startListening();
    }
  });

  recognition.addEventListener("result", (event) => {
    const transcript = Array.from(event.results)
      .slice(event.resultIndex)
      .map((result) => result[0].transcript)
      .join(" ");
    handleTranscript(transcript);
  });

  recognition.addEventListener("start", () => {
    listening = true;
    micButton.classList.add("is-listening");
    voiceStatus.textContent = `Listening for ${sessionLabels[selectedSession]} names in Round ${selectedRound}.`;
  });

  recognition.addEventListener("end", () => {
    listening = false;
    micButton.classList.remove("is-listening");
    if (!voiceTranscript.textContent) {
      voiceStatus.textContent = "Tap Speak Names to mark players by voice.";
    }
  });

  recognition.addEventListener("error", (event) => {
    listening = false;
    micButton.classList.remove("is-listening");
    voiceStatus.textContent = getVoiceErrorMessage(event.error);
  });
}

function startListening() {
  voiceTranscript.textContent = "";
  try {
    recognition.start();
  } catch {
    voiceStatus.textContent = "Voice input is already starting.";
  }
}

async function handleTranscript(transcript) {
  const matchedPlayers = findSpokenPlayers(transcript);
  voiceTranscript.textContent = `"${transcript.trim()}"`;

  if (!matchedPlayers.length) {
    voiceStatus.textContent = "No roster names or nicknames matched. Try saying the nickname or first and last name clearly.";
    return;
  }

  const newMarks = matchedPlayers
    .filter((player) => markAttendance(player.id, selectedRound, selectedSession))
    .map((player) => ({ playerId: player.id, round: selectedRound, session: selectedSession }));
  await upsertCloudAttendance(newMarks);
  saveAttendance();
  render();
  voiceStatus.textContent = `Marked ${matchedPlayers.map((player) => player.name).join(", ")}.`;
}

function findSpokenPlayers(transcript) {
  const spoken = normalizeSpeechText(transcript);
  const compactSpoken = spoken.replaceAll(" ", "");
  return sortedPlayers().filter((player) => {
    const firstName = normalizeSpeechText(player.name.split(" ")[0]);
    const aliases = getPlayerAliases(player);

    return (
      aliases.some((alias) => spoken.includes(alias) || compactSpoken.includes(alias.replaceAll(" ", ""))) ||
      (uniqueFirstName(firstName) && spoken.includes(firstName))
    );
  });
}

function getPlayerAliases(player) {
  const aliases = new Set([normalizeSpeechText(player.name)]);
  const nickname = player.nickname || player.name.match(/\((.*?)\)/)?.[1];
  const lastName = player.name.split(" ").at(-1);

  aliases.add(normalizeSpeechText(player.name.replace(/\((.*?)\)/g, "$1")));
  aliases.add(normalizeSpeechText(player.nickname || ""));

  if (nickname && lastName) {
    aliases.add(normalizeSpeechText(`${nickname} ${lastName}`));
  }

  return [...aliases].filter(Boolean);
}

function uniqueFirstName(firstName) {
  return players.filter((player) => normalizeSpeechText(player.name.split(" ")[0]) === firstName).length === 1;
}

function normalizeSpeechText(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getVoiceErrorMessage(error) {
  const messages = {
    "not-allowed": "Microphone permission was blocked.",
    "no-speech": "I did not hear any names. Try again a little closer to the mic.",
    "audio-capture": "No microphone was found.",
    network: "Voice recognition needs browser speech services and could not connect."
  };
  return messages[error] || "Voice input stopped. Try again.";
}

async function setupCloudSync() {
  if (!cloudClient) {
    loginForm.hidden = true;
    signOutButton.hidden = true;
    syncTitle.textContent = "Local Mode";
    syncStatus.textContent = "Cloud sync is ready in the code. Add Supabase settings to config.js to connect phone and laptop.";
    return;
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;

    const { error } = await cloudClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: globalThis.location.href.split("#")[0]
      }
    });

    syncStatus.textContent = error
      ? `Login link failed: ${error.message}`
      : "Check your email for the login link.";
  });

  signOutButton.addEventListener("click", async () => {
    await cloudClient.auth.signOut();
    currentUser = null;
    updateSyncUi();
  });

  cloudClient.auth.onAuthStateChange(async (_event, session) => {
    currentUser = session?.user || null;
    updateSyncUi();
    if (currentUser) {
      await initializeCloudData();
    }
  });

  const { data } = await cloudClient.auth.getSession();
  currentUser = data.session?.user || null;
  updateSyncUi();

  if (currentUser) {
    await initializeCloudData();
  }
}

function updateSyncUi() {
  if (!cloudClient) return;

  if (currentUser) {
    loginForm.hidden = true;
    signOutButton.hidden = false;
    syncTitle.textContent = "Cloud Sync On";
    syncStatus.textContent = `Signed in as ${currentUser.email}. Changes sync with approved Beena team members.`;
  } else {
    loginForm.hidden = false;
    signOutButton.hidden = true;
    syncTitle.textContent = "Cloud Sync";
    syncStatus.textContent = "Sign in with an approved team email.";
  }
}

async function initializeCloudData() {
  const hasCloudRoster = await loadCloudData();

  if (!hasCloudRoster) {
    await syncLocalToCloud();
    await loadCloudData();
  }
}

async function loadCloudData() {
  if (!currentUser) return false;

  syncStatus.textContent = "Loading cloud data...";

  const [
    { data: cloudPlayers, error: playersError },
    { data: cloudAttendance, error: attendanceError },
    { data: cloudLineups, error: lineupsError }
  ] = await Promise.all([
    fetchCloudPlayers(),
    cloudClient
      .from("attendance")
      .select("player_id,round,session")
      .eq("team_id", teamId),
    cloudClient
      .from("lineups")
      .select("round,spot_id,player_id")
      .eq("team_id", teamId)
  ]);

  if (playersError || attendanceError) {
    syncStatus.textContent = `Cloud load failed: ${(playersError || attendanceError).message}`;
    return false;
  }

  if (cloudPlayers.length) {
    const localNicknames = new Map(players.map((player) => [player.id, player.nickname || ""]));
    players = cloudPlayers.map((player) => ({
      id: player.id,
      name: player.name,
      nickname: player.nickname ?? localNicknames.get(player.id) ?? "",
      number: player.number || "",
      position: player.position || "Utility",
      status: player.status || "Available",
      notes: player.notes || "",
      training: false,
      match: false
    }));
    attendance = rowsToAttendance(cloudAttendance || []);
    lineups = rowsToLineups(lineupsError ? [] : cloudLineups || []);
    normalizeAttendance();
    normalizeLineups();
    savePlayers();
    saveAttendance();
    saveLineups();
    render();
  }

  syncStatus.textContent = lineupsError
    ? `Synced ${players.length} players. Run the lineup SQL to sync starting lineups.`
    : `Synced ${players.length} players.`;
  return cloudPlayers.length > 0;
}

async function fetchCloudPlayers() {
  const columns = cloudNicknameColumnAvailable
    ? "id,name,nickname,number,position,status,notes"
    : "id,name,number,position,status,notes";
  const result = await cloudClient
    .from("players")
    .select(columns)
    .eq("team_id", teamId)
    .order("name", { ascending: true });

  if (result.error && cloudNicknameColumnAvailable && isMissingNicknameColumn(result.error)) {
    cloudNicknameColumnAvailable = false;
    return fetchCloudPlayers();
  }

  return result;
}

async function syncLocalToCloud() {
  if (!currentUser) return;

  ensureCloudSafePlayerIds();
  await upsertCloudPlayers(players);
  await upsertCloudAttendance(attendanceToRows());
  await upsertCloudLineups(lineupsToRows());
}

function ensureCloudSafePlayerIds() {
  const idMap = new Map();

  players = players.map((player) => {
    if (uuidPattern.test(player.id)) return player;
    const nextId = makeId();
    idMap.set(player.id, nextId);
    return { ...player, id: nextId };
  });

  if (!idMap.size) return;

  for (let round = 1; round <= roundCount; round += 1) {
    sessions.forEach((session) => {
      attendance[String(round)][session] = attendance[String(round)][session].map((playerId) =>
        idMap.get(playerId) || playerId
      );
    });

    Object.keys(lineups[String(round)] || {}).forEach((spotId) => {
      const playerId = lineups[String(round)][spotId];
      lineups[String(round)][spotId] = idMap.get(playerId) || playerId;
    });
  }

  savePlayers();
  saveAttendance();
  saveLineups();
}

async function upsertCloudPlayers(playerList) {
  if (!currentUser || !playerList.length) return;

  const rows = playerList.map((player) => ({
    id: player.id,
    team_id: teamId,
    user_id: currentUser.id,
    name: player.name,
    ...(cloudNicknameColumnAvailable ? { nickname: player.nickname || "" } : {}),
    number: player.number || "",
    position: player.position || "Utility",
    status: player.status || "Available",
    notes: player.notes || ""
  }));

  const { error } = await cloudClient.from("players").upsert(rows);
  if (error) {
    if (cloudNicknameColumnAvailable && isMissingNicknameColumn(error)) {
      cloudNicknameColumnAvailable = false;
      await upsertCloudPlayers(playerList);
      syncStatus.textContent = "Nicknames are saved on this device. Run nickname_upgrade.sql in Supabase to sync them.";
      return;
    }
    syncStatus.textContent = `Player sync failed: ${error.message}`;
  }
}

function isMissingNicknameColumn(error) {
  return error.message?.toLowerCase().includes("nickname") || error.details?.toLowerCase().includes("nickname");
}

async function upsertCloudAttendance(rows) {
  if (!currentUser || !rows.length) return;

  const payload = rows.map((row) => ({
    team_id: teamId,
    user_id: currentUser.id,
    player_id: row.playerId,
    round: row.round,
    session: row.session
  }));

  const { error } = await cloudClient.from("attendance").upsert(payload);
  if (error) {
    syncStatus.textContent = `Attendance sync failed: ${error.message}`;
  }
}

async function deleteCloudAttendance(playerId, round, session) {
  if (!currentUser) return;

  const { error } = await cloudClient
    .from("attendance")
    .delete()
    .eq("team_id", teamId)
    .eq("player_id", playerId)
    .eq("round", round)
    .eq("session", session);

  if (error) {
    syncStatus.textContent = `Attendance sync failed: ${error.message}`;
  }
}

async function upsertCloudLineups(rows) {
  if (!currentUser || !rows.length) return;

  const payload = rows.map((row) => ({
    team_id: teamId,
    user_id: currentUser.id,
    round: row.round,
    spot_id: row.spotId,
    player_id: row.playerId
  }));

  const { error } = await cloudClient.from("lineups").upsert(payload);
  if (error) {
    syncStatus.textContent = `Lineup sync failed: ${error.message}`;
  }
}

async function deleteCloudLineupSpot(round, spotId) {
  if (!currentUser) return;

  const { error } = await cloudClient
    .from("lineups")
    .delete()
    .eq("team_id", teamId)
    .eq("round", round)
    .eq("spot_id", spotId);

  if (error) {
    syncStatus.textContent = `Lineup sync failed: ${error.message}`;
  }
}

async function deleteCloudLineupRound(round) {
  if (!currentUser) return;

  const { error } = await cloudClient
    .from("lineups")
    .delete()
    .eq("team_id", teamId)
    .eq("round", round);

  if (error) {
    syncStatus.textContent = `Lineup sync failed: ${error.message}`;
  }
}

async function deleteCloudPlayer(playerId) {
  if (!currentUser) return;

  const { error } = await cloudClient
    .from("players")
    .delete()
    .eq("team_id", teamId)
    .eq("id", playerId);

  if (error) {
    syncStatus.textContent = `Player delete failed: ${error.message}`;
  }
}

function attendanceToRows() {
  const rows = [];

  for (let round = 1; round <= roundCount; round += 1) {
    sessions.forEach((session) => {
      attendance[String(round)]?.[session]?.forEach((playerId) => {
        rows.push({ playerId, round, session });
      });
    });
  }

  return rows;
}

function rowsToAttendance(rows) {
  const nextAttendance = {};

  for (let round = 1; round <= roundCount; round += 1) {
    nextAttendance[String(round)] = { monday: [], thursday: [], game: [] };
  }

  rows.forEach((row) => {
    if (nextAttendance[String(row.round)]?.[row.session]) {
      nextAttendance[String(row.round)][row.session].push(row.player_id);
    }
  });

  return nextAttendance;
}

function lineupsToRows() {
  const rows = [];

  for (let round = 1; round <= roundCount; round += 1) {
    Object.entries(lineups[String(round)] || {}).forEach(([spotId, playerId]) => {
      rows.push({ round, spotId, playerId });
    });
  }

  return rows;
}

function rowsToLineups(rows) {
  const nextLineups = {};

  for (let round = 1; round <= roundCount; round += 1) {
    nextLineups[String(round)] = {};
  }

  rows.forEach((row) => {
    nextLineups[String(row.round)][row.spot_id] = row.player_id;
  });

  return nextLineups;
}

function updateSummary() {
  const round = attendance[String(selectedRound)];
  const monday = round.monday.length;
  const thursday = round.thursday.length;
  const game = round.game.length;
  const allSessions = players.filter((player) =>
    sessions.every((session) => hasAttendance(player.id, selectedRound, session))
  ).length;

  document.querySelector("#totalPlayers").textContent = players.length;
  document.querySelector("#mondayCount").textContent = monday;
  document.querySelector("#thursdayCount").textContent = thursday;
  document.querySelector("#gameCount").textContent = game;
  document.querySelector("#allSessionsCount").textContent = allSessions;
}

function getSeasonTotals(playerId) {
  const totals = { monday: 0, thursday: 0, game: 0, total: 0 };

  for (let round = 1; round <= roundCount; round += 1) {
    sessions.forEach((session) => {
      if (hasAttendance(playerId, round, session)) {
        totals[session] += 1;
        totals.total += 1;
      }
    });
  }

  return totals;
}

function exportCsv() {
  const header = ["player", "nickname", "round", "monday_training", "thursday_training", "game_day_available", "notes"];
  const rows = [];

  sortedPlayers().forEach((player) => {
    for (let round = 1; round <= roundCount; round += 1) {
      rows.push([
        player.name,
        player.nickname || "",
        round,
        hasAttendance(player.id, round, "monday") ? "Yes" : "",
        hasAttendance(player.id, round, "thursday") ? "Yes" : "",
        hasAttendance(player.id, round, "game") ? "Yes" : "",
        player.notes || ""
      ]);
    }
  });

  const csv = [header, ...rows]
    .map((row) => row.map((value) => csvEscape(String(value ?? ""))).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `murrumbeena-lions-attendance-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function importCsv(event) {
  const [file] = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    const imported = parseCsv(String(reader.result))
      .map(normalizeImportedPlayer)
      .filter((player) => player.name);

    if (imported.length) {
      players = imported;
      savePlayers();
      await upsertCloudPlayers(players);
      render();
    }

    event.target.value = "";
  });
  reader.readAsText(file);
}

function normalizeImportedPlayer(row) {
  return {
    id: makeId(),
    name: row.name || row.player || "",
    nickname: row.nickname || "",
    number: row.number || "",
    position: row.position || "Utility",
    status: "Available",
    training: false,
    match: false,
    notes: row.notes || ""
  };
}

function csvEscape(value) {
  if (/[",\n]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function parseCsv(text) {
  const rows = [];
  let current = "";
  let row = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(current);
      current = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += character;
    }
  }

  if (current || row.length) {
    row.push(current);
    rows.push(row);
  }

  const [headers = [], ...records] = rows;
  return records.map((record) =>
    headers.reduce((object, header, index) => {
      object[header.trim()] = (record[index] || "").trim();
      return object;
    }, {})
  );
}
