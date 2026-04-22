const storageKey = "footy-team-manager-v1";
const attendanceKey = "footy-team-round-attendance-v1";
const lineupsKey = "footy-team-lineups-v1";
const fixturesKey = "footy-team-fixtures-v1";
const lineupNameModeKey = "footy-team-lineup-name-mode-v1";
const fixturesSeedKey = "footy-team-fixtures-2026-seeded-v1";
const rosterKey = "footy-team-roster-2026-v1";
const roundCount = 16;
const sessions = ["monday", "thursday", "game"];
const gameUnavailableSession = "game_unavailable";
const allAttendanceSessions = [...sessions, gameUnavailableSession];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sessionLabels = {
  monday: "Monday Training",
  thursday: "Thursday Training",
  game: "Game Day Availability",
  lineup: "Starting Lineup"
};
const fixtureTeams = ["U19's", "Senior Mens", "Reserve Mens", "Open Mens", "Senior Womens"];
const homeVenue = "Murrumbeena Park";
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
let fixtures = loadFixtures();
let selectedRound = 1;
let selectedSession = "monday";
let selectedPage = "manager";
let selectedFixtureTeam = "All";
let showPastFixtures = false;
let selectedLineupPlayerId = null;
let lineupNameMode = localStorage.getItem(lineupNameModeKey) || "full";
let draggedLineupPlayerId = null;

const form = document.querySelector("#playerForm");
const pageButtons = document.querySelectorAll("[data-page]");
const managerPage = document.querySelector("#managerPage");
const fixturesPage = document.querySelector("#fixturesPage");
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
const fixtureFilters = document.querySelector("#fixtureFilters");
const fixtureDays = document.querySelector("#fixtureDays");
const fixtureSummary = document.querySelector("#fixturesSummary");
const showPastFixturesInput = document.querySelector("#showPastFixtures");
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
let cloudFixturesAvailable = true;

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
const defaultFixtures = [
  {
    id: "open-mens-round-1-2026",
    round: "1",
    date: "2026-04-10",
    time: "19:00",
    team: "Open Mens",
    opponent: "South Yarra Open Grade",
    venue: "Moorleigh Reserve / Moorleigh Reserve 1",
    notes: "Final: South Yarra won by 28 points"
  },
  {
    id: "open-mens-round-2-2026",
    round: "2",
    date: "2026-04-18",
    time: "10:00",
    team: "Open Mens",
    opponent: "Pakenham Open Grade",
    venue: "Toomuc Reserve / Toomuc Reserve 1",
    notes: "Final: Pakenham won by 67 points"
  },
  {
    id: "open-mens-round-3-2026",
    round: "3",
    date: "2026-04-25",
    time: "10:00",
    team: "Open Mens",
    opponent: "Skye Open Grade",
    venue: "Carrum Downs Recreation Reserve / Carrum Downs Recreation Reserve 1",
    notes: "Upcoming"
  },
  {
    id: "open-mens-round-4-2026",
    round: "4",
    date: "2026-05-02",
    time: "10:00",
    team: "Open Mens",
    opponent: "Endeavour Hills Open Grade",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "u19s-round-1-2026",
    round: "1",
    date: "2026-04-11",
    time: "10:00",
    team: "U19's",
    opponent: "East Brighton U19s",
    venue: "Hurlingham Park / Hurlingham Park 1",
    notes: "Final: Murrumbeena won by forfeit"
  },
  {
    id: "u19s-round-2-2026",
    round: "2",
    date: "2026-04-18",
    time: "10:40",
    team: "U19's",
    opponent: "Officer U19s",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Final: Murrumbeena won by 156 points"
  },
  {
    id: "u19s-round-3-2026",
    round: "3",
    date: "2026-04-25",
    time: "10:40",
    team: "U19's",
    opponent: "Berwick Springs U19s",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "u19s-round-4-2026",
    round: "4",
    date: "2026-05-02",
    time: "10:40",
    team: "U19's",
    opponent: "Bentleigh U19s",
    venue: "Bentleigh Recreation Reserve / Bentleigh Recreation Reserve 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-1-2026",
    round: "1",
    date: "2026-04-11",
    time: "12:00",
    team: "Reserve Mens",
    opponent: "Cranbourne Eagles Reserves",
    venue: "Amstel Reserve (Livingston Rec Reserve) / Amstel Reserve (Livingston Rec Reserve) 1",
    notes: "Final: Cranbourne Eagles won by 4 points"
  },
  {
    id: "reserve-mens-round-2-2026",
    round: "2",
    date: "2026-04-18",
    time: "12:30",
    team: "Reserve Mens",
    opponent: "Springvale Districts Reserves",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Final: Murrumbeena won by 2 points"
  },
  {
    id: "reserve-mens-round-3-2026",
    round: "3",
    date: "2026-04-25",
    time: "12:30",
    team: "Reserve Mens",
    opponent: "St Paul's McKinnon Reserves",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "ANZAC Day"
  },
  {
    id: "reserve-mens-round-4-2026",
    round: "4",
    date: "2026-05-02",
    time: "12:30",
    team: "Reserve Mens",
    opponent: "Bentleigh Reserves",
    venue: "Bentleigh Recreation Reserve / Bentleigh Recreation Reserve 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-5-2026",
    round: "5",
    date: "2026-05-09",
    time: "12:30",
    team: "Reserve Mens",
    opponent: "Narre Warren Reserves",
    venue: "Kalora Park / Kalora Park 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-6-2026",
    round: "6",
    date: "2026-05-16",
    time: "12:30",
    team: "Reserve Mens",
    opponent: "Dingley Reserves",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-7-2026",
    round: "7",
    date: "2026-05-23",
    time: "12:30",
    team: "Reserve Mens",
    opponent: "Port Melbourne Colts Reserves",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-8-2026",
    round: "8",
    date: "2026-05-30",
    time: "12:00",
    team: "Reserve Mens",
    opponent: "Hampton Park Reserves",
    venue: "Robert Booth Reserve / Robert Booth Reserve 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-9-2026",
    round: "9",
    date: "2026-06-13",
    time: "12:00",
    team: "Reserve Mens",
    opponent: "Cheltenham Reserves",
    venue: "Jack Barker Oval / Jack Barker Oval 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-10-2026",
    round: "10",
    date: "2026-06-20",
    time: "12:00",
    team: "Reserve Mens",
    opponent: "Cranbourne Eagles Reserves",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-11-2026",
    round: "11",
    date: "2026-06-27",
    time: "12:00",
    team: "Reserve Mens",
    opponent: "Springvale Districts Reserves",
    venue: "Springvale Reserve / Springvale Reserve 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-12-2026",
    round: "12",
    date: "2026-07-11",
    time: "12:00",
    team: "Reserve Mens",
    opponent: "St Paul's McKinnon Reserves",
    venue: "McKinnon Reserve / McKinnon Reserve 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-13-2026",
    round: "13",
    date: "2026-07-18",
    time: "12:30",
    team: "Reserve Mens",
    opponent: "Bentleigh Reserves",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-14-2026",
    round: "14",
    date: "2026-07-25",
    time: "12:30",
    team: "Reserve Mens",
    opponent: "Narre Warren Reserves",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-15-2026",
    round: "15",
    date: "2026-08-01",
    time: "12:00",
    team: "Reserve Mens",
    opponent: "Port Melbourne Colts Reserves",
    venue: "JL Murphy Reserve / JL Murphy - MC Labour Oval",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-16-2026",
    round: "16",
    date: "2026-08-08",
    time: "12:00",
    team: "Reserve Mens",
    opponent: "Dingley Reserves",
    venue: "Souter Reserve (including Corrigan Oval) / Souter Reserve (including Corrigan Oval) 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-17-2026",
    round: "17",
    date: "2026-08-15",
    time: "12:30",
    team: "Reserve Mens",
    opponent: "Hampton Park Reserves",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "reserve-mens-round-18-2026",
    round: "18",
    date: "2026-08-22",
    time: "12:00",
    team: "Reserve Mens",
    opponent: "Cheltenham Reserves",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-1-2026",
    round: "1",
    date: "2026-04-11",
    time: "14:00",
    team: "Senior Mens",
    opponent: "Cranbourne Eagles Seniors",
    venue: "Amstel Reserve (Livingston Rec Reserve) / Amstel Reserve (Livingston Rec Reserve) 1",
    notes: "Final: Cranbourne Eagles won by 15 points"
  },
  {
    id: "senior-mens-round-2-2026",
    round: "2",
    date: "2026-04-18",
    time: "14:30",
    team: "Senior Mens",
    opponent: "Springvale Districts Seniors",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Final: Murrumbeena won by 8 points"
  },
  {
    id: "senior-mens-round-3-2026",
    round: "3",
    date: "2026-04-25",
    time: "14:30",
    team: "Senior Mens",
    opponent: "St Paul's McKinnon Seniors",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "ANZAC Day"
  },
  {
    id: "senior-mens-round-4-2026",
    round: "4",
    date: "2026-05-02",
    time: "14:30",
    team: "Senior Mens",
    opponent: "Bentleigh Seniors",
    venue: "Bentleigh Recreation Reserve / Bentleigh Recreation Reserve 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-5-2026",
    round: "5",
    date: "2026-05-09",
    time: "14:30",
    team: "Senior Mens",
    opponent: "Narre Warren Seniors",
    venue: "Kalora Park / Kalora Park 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-6-2026",
    round: "6",
    date: "2026-05-16",
    time: "14:30",
    team: "Senior Mens",
    opponent: "Dingley Seniors",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-7-2026",
    round: "7",
    date: "2026-05-23",
    time: "14:30",
    team: "Senior Mens",
    opponent: "Port Melbourne Colts Seniors",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-8-2026",
    round: "8",
    date: "2026-05-30",
    time: "14:00",
    team: "Senior Mens",
    opponent: "Hampton Park Seniors",
    venue: "Robert Booth Reserve / Robert Booth Reserve 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-9-2026",
    round: "9",
    date: "2026-06-13",
    time: "14:00",
    team: "Senior Mens",
    opponent: "Cheltenham Seniors",
    venue: "Jack Barker Oval / Jack Barker Oval 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-10-2026",
    round: "10",
    date: "2026-06-20",
    time: "14:00",
    team: "Senior Mens",
    opponent: "Cranbourne Eagles Seniors",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-11-2026",
    round: "11",
    date: "2026-06-27",
    time: "14:00",
    team: "Senior Mens",
    opponent: "Springvale Districts Seniors",
    venue: "Springvale Reserve / Springvale Reserve 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-12-2026",
    round: "12",
    date: "2026-07-11",
    time: "14:00",
    team: "Senior Mens",
    opponent: "St Paul's McKinnon Seniors",
    venue: "McKinnon Reserve / McKinnon Reserve 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-13-2026",
    round: "13",
    date: "2026-07-18",
    time: "14:30",
    team: "Senior Mens",
    opponent: "Bentleigh Seniors",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-14-2026",
    round: "14",
    date: "2026-07-25",
    time: "14:30",
    team: "Senior Mens",
    opponent: "Narre Warren Seniors",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-15-2026",
    round: "15",
    date: "2026-08-01",
    time: "14:00",
    team: "Senior Mens",
    opponent: "Port Melbourne Colts Seniors",
    venue: "JL Murphy Reserve / JL Murphy - MC Labour Oval",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-16-2026",
    round: "16",
    date: "2026-08-08",
    time: "14:00",
    team: "Senior Mens",
    opponent: "Dingley Seniors",
    venue: "Souter Reserve (including Corrigan Oval) / Souter Reserve (including Corrigan Oval) 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-17-2026",
    round: "17",
    date: "2026-08-15",
    time: "14:30",
    team: "Senior Mens",
    opponent: "Hampton Park Seniors",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "senior-mens-round-18-2026",
    round: "18",
    date: "2026-08-22",
    time: "14:00",
    team: "Senior Mens",
    opponent: "Cheltenham Seniors",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "senior-womens-round-1-2026",
    round: "1",
    date: "2026-04-11",
    time: "10:00",
    team: "Senior Womens",
    opponent: "Endeavour Hills Womens 1",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Final: Endeavour Hills won by 88 points"
  },
  {
    id: "senior-womens-round-2-2026",
    round: "2",
    date: "2026-04-18",
    time: "10:00",
    team: "Senior Womens",
    opponent: "Frankston Dolphins Womens",
    venue: "Overport Park / Overport Park 2",
    notes: "Final: Murrumbeena won by 132 points"
  },
  {
    id: "senior-womens-round-3-2026",
    round: "3",
    date: "2026-04-25",
    time: "08:55",
    team: "Senior Womens",
    opponent: "Narre South Saints Womens",
    venue: "Murrumbeena Park / Murrumbeena Park 1",
    notes: "Upcoming"
  },
  {
    id: "senior-womens-round-4-2026",
    round: "4",
    date: "2026-05-02",
    time: "08:55",
    team: "Senior Womens",
    opponent: "Bentleigh Womens",
    venue: "Bentleigh Recreation Reserve / Bentleigh Recreation Reserve 1",
    notes: "Upcoming"
  }
];

if (!players.length) {
  players = defaultPlayers;
  savePlayers();
}

mergeRoster();
seedDefaultFixtures();
normalizeAttendance();
normalizeLineups();
dedupeLocalPlayers();
selectLatestRoundWithData();
renderFixtureFilters();
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

pageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedPage = button.dataset.page;
    render();
  });
});

showPastFixturesInput.addEventListener("change", () => {
  showPastFixtures = showPastFixturesInput.checked;
  renderFixtures();
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

function loadFixtures() {
  try {
    return JSON.parse(localStorage.getItem(fixturesKey)) || [];
  } catch {
    return [];
  }
}

function saveAttendance() {
  localStorage.setItem(attendanceKey, JSON.stringify(attendance));
}

function saveLineups() {
  localStorage.setItem(lineupsKey, JSON.stringify(lineups));
}

function saveFixtures() {
  localStorage.setItem(fixturesKey, JSON.stringify(fixtures));
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

function seedDefaultFixtures() {
  const existingIds = new Set(fixtures.map((fixture) => fixture.id));
  const missingFixtures = defaultFixtures.filter((fixture) => !existingIds.has(fixture.id));

  if (!missingFixtures.length) {
    localStorage.setItem(fixturesSeedKey, "true");
    return;
  }

  fixtures = fixtures.concat(missingFixtures);
  saveFixtures();
  localStorage.setItem(fixturesSeedKey, "true");
}

function normalizeAttendance() {
  for (let round = 1; round <= roundCount; round += 1) {
    const key = String(round);
    attendance[key] ||= {};
    allAttendanceSessions.forEach((session) => {
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

function dedupeLocalPlayers() {
  const { players: uniquePlayers, idMap } = dedupePlayersByName(players);
  if (!idMap.size) return;

  players = uniquePlayers;
  remapLocalPlayerIds(idMap);
  savePlayers();
  saveAttendance();
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
    spot.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      spot.classList.add("is-drag-over");
    });
    spot.addEventListener("dragleave", () => spot.classList.remove("is-drag-over"));
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

function renderFixtureFilters() {
  fixtureFilters.replaceChildren();
  ["All", ...fixtureTeams].forEach((team) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = team;
    button.classList.toggle("is-active", team === selectedFixtureTeam);
    button.addEventListener("click", () => {
      selectedFixtureTeam = team;
      renderFixtureFilters();
      renderFixtures();
    });
    fixtureFilters.append(button);
  });
}

function renderFixtures() {
  const visibleFixtures = sortedFixtures().filter((fixture) =>
    (selectedFixtureTeam === "All" || fixture.team === selectedFixtureTeam) &&
    (showPastFixtures || isUpcomingFixture(fixture))
  );
  const upcomingCount = sortedFixtures().filter((fixture) => fixture.date >= getTodayDateString()).length;
  const hiddenPastCount = sortedFixtures().filter((fixture) =>
    (selectedFixtureTeam === "All" || fixture.team === selectedFixtureTeam) &&
    !isUpcomingFixture(fixture)
  ).length;

  showPastFixturesInput.checked = showPastFixtures;
  fixtureSummary.textContent = `${fixtures.length} games · ${upcomingCount} upcoming${showPastFixtures ? "" : ` · ${hiddenPastCount} hidden`}`;
  fixtureDays.replaceChildren();

  if (!visibleFixtures.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state is-visible fixture-empty";
    empty.innerHTML = showPastFixtures
      ? "<strong>No fixtures yet.</strong><span>Add one with the form on the right.</span>"
      : "<strong>No upcoming fixtures shown.</strong><span>Turn on Show past games to see older fixtures.</span>";
    fixtureDays.append(empty);
    return;
  }

  groupFixturesByDate(visibleFixtures).forEach(([date, dayFixtures]) => {
    const day = document.createElement("article");
    const heading = document.createElement("div");
    const title = document.createElement("h3");
    const meta = document.createElement("span");

    day.className = "fixture-day";
    heading.className = "fixture-day-heading";
    title.textContent = formatFixtureDate(date);
    meta.textContent = `${dayFixtures.length} game${dayFixtures.length === 1 ? "" : "s"}`;
    heading.append(title, meta);
    day.append(heading);

    dayFixtures.forEach((fixture) => day.append(createFixtureCard(fixture)));
    fixtureDays.append(day);
  });
}

function createFixtureCard(fixture) {
  const card = document.createElement("div");
  const main = document.createElement("div");
  const detail = document.createElement("div");
  const actions = document.createElement("div");
  const label = document.createElement("span");
  const title = document.createElement("strong");
  const meta = document.createElement("small");
  const editButton = document.createElement("button");
  const home = isHomeFixture(fixture);

  card.className = "fixture-card";
  card.classList.toggle("is-home", home);
  label.className = "fixture-team-label";
  label.textContent = fixture.team;
  title.textContent = home ? "Home" : fixture.opponent;
  meta.textContent = [
    fixture.round ? `Round ${fixture.round}` : "",
    fixture.time ? formatFixtureTime(fixture.time) : "TBC",
    fixture.venue,
    fixture.notes
  ].filter(Boolean).join(" · ");
  main.append(label, title, meta);

  detail.className = "fixture-location";
  detail.textContent = home ? homeVenue : fixture.opponent;

  actions.className = "fixture-card-actions";
  editButton.type = "button";
  editButton.textContent = fixture.round ? `Round ${fixture.round}` : "Fixture";
  editButton.className = "fixture-round-pill";
  editButton.disabled = true;
  actions.append(editButton);

  card.append(main, detail, actions);
  return card;
}

function sortedFixtures() {
  return [...fixtures].sort((a, b) =>
    `${a.date} ${a.time || "99:99"}`.localeCompare(`${b.date} ${b.time || "99:99"}`) ||
    a.team.localeCompare(b.team)
  );
}

function groupFixturesByDate(fixtureList) {
  const groups = new Map();
  fixtureList.forEach((fixture) => {
    if (!groups.has(fixture.date)) groups.set(fixture.date, []);
    groups.get(fixture.date).push(fixture);
  });
  return [...groups.entries()];
}

function isHomeFixture(fixture) {
  return normalizeSpeechText(fixture.venue).includes(normalizeSpeechText(homeVenue));
}

function isUpcomingFixture(fixture) {
  return fixture.date >= getTodayDateString();
}

function formatFixtureDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function formatFixtureTime(value) {
  const [hours, minutes] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return new Intl.DateTimeFormat("en-AU", { hour: "numeric", minute: "2-digit" }).format(date);
}

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function selectLatestRoundWithData() {
  selectedRound = getLatestRoundWithData();
  selectedLineupPlayerId = null;
}

function getLatestRoundWithData() {
  for (let round = roundCount; round >= 1; round -= 1) {
    const roundAttendance = attendance[String(round)];
    const roundLineup = lineups[String(round)] || {};
    const hasAttendanceData = allAttendanceSessions.some((session) => roundAttendance?.[session]?.length);
    const hasLineupData = Object.values(roundLineup).some(Boolean);

    if (hasAttendanceData || hasLineupData) {
      return round;
    }
  }

  return 1;
}

function render() {
  renderPage();
  if (selectedPage === "fixtures") {
    renderFixtures();
    return;
  }

  document.querySelector("#roundTitle").textContent = `Round ${selectedRound}`;
  document.querySelector("#modeEyebrow").textContent = selectedSession === "lineup" ? "Starting 16" : "Mark Attendance";
  document.querySelector("#sessionTitle").textContent = sessionLabels[selectedSession];
  document.querySelector("#roundTableTitle").textContent = `Round ${selectedRound} Table`;
  renderMode();
  renderRoundTable();
  renderSeasonTable();
  updateSummary();
}

function renderPage() {
  pageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.page === selectedPage);
  });
  managerPage.hidden = selectedPage !== "manager";
  fixturesPage.hidden = selectedPage !== "fixtures";
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
    if (selectedSession === "game") {
      playerGrid.append(createGameAvailabilityCard(player));
      return;
    }

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

function createGameAvailabilityCard(player) {
  const card = document.createElement("div");
  const jumper = document.createElement("span");
  const text = document.createElement("span");
  const name = document.createElement("strong");
  const meta = document.createElement("small");
  const actions = document.createElement("span");
  const availableButton = document.createElement("button");
  const unavailableButton = document.createElement("button");
  const isAvailable = hasAttendance(player.id, selectedRound, "game");
  const isUnavailable = hasAttendance(player.id, selectedRound, gameUnavailableSession);

  card.className = "player-card availability-card";
  card.classList.toggle("is-selected", isAvailable);
  card.classList.toggle("is-unavailable", isUnavailable);
  jumper.className = "guernsey";
  jumper.textContent = player.number || "";
  name.className = "player-name";
  name.textContent = player.name;
  meta.className = "player-meta";
  meta.textContent = isAvailable ? "Available" : isUnavailable ? "Not available" : "No response";
  actions.className = "availability-actions";
  availableButton.type = "button";
  availableButton.textContent = "✓";
  availableButton.className = "availability-button available";
  availableButton.classList.toggle("is-active", isAvailable);
  availableButton.setAttribute("aria-label", `${player.name} available`);
  availableButton.title = "Available";
  unavailableButton.type = "button";
  unavailableButton.textContent = "×";
  unavailableButton.className = "availability-button unavailable";
  unavailableButton.classList.toggle("is-active", isUnavailable);
  unavailableButton.setAttribute("aria-label", `${player.name} not available`);
  unavailableButton.title = "Not available";

  availableButton.addEventListener("click", () => setGameAvailability(player.id, "available"));
  unavailableButton.addEventListener("click", () => setGameAvailability(player.id, "unavailable"));

  text.append(name, meta);
  actions.append(availableButton, unavailableButton);
  card.append(jumper, text, actions);
  return card;
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
      fitLineupSpotName(spot);
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
    .sort((a, b) => getWeeklyTrainingCount(b.id) - getWeeklyTrainingCount(a.id) || a.name.localeCompare(b.name))
    .forEach((player) => {
      const chip = document.createElement("button");
      const name = document.createElement("span");
      const training = document.createElement("span");
      chip.type = "button";
      chip.className = "lineup-player-chip";
      chip.classList.toggle("is-picked", selectedLineupPlayerId === player.id);
      chip.draggable = true;
      chip.dataset.playerId = player.id;
      name.className = "lineup-chip-name";
      name.textContent = getLineupDisplayName(player);
      training.className = "lineup-chip-training";
      training.textContent = `${getWeeklyTrainingCount(player.id)}/2`;
      training.title = "Training attendance this week";
      chip.append(name, training);
      chip.addEventListener("dragstart", handleLineupPlayerDragStart);
      chip.addEventListener("dragend", handleLineupDragEnd);
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

function fitLineupSpotName(spot) {
  const lines = [...spot.querySelectorAll(".lineup-name-line")];
  if (!lines.length) return;

  spot.style.fontSize = "";
  const minSize = 6;
  let size = Number.parseFloat(getComputedStyle(spot).fontSize);

  while (size > minSize && lines.some((line) => line.scrollWidth > line.clientWidth)) {
    size -= 0.5;
    spot.style.fontSize = `${size}px`;
  }
}

function getWeeklyTrainingCount(playerId) {
  return ["monday", "thursday"].filter((session) => hasAttendance(playerId, selectedRound, session)).length;
}

function handleLineupPlayerDragStart(event) {
  draggedLineupPlayerId = event.currentTarget.dataset.playerId;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", event.currentTarget.dataset.playerId);
}

function handleLineupSpotDragStart(event) {
  const playerId = event.currentTarget.dataset.playerId;
  if (playerId) {
    draggedLineupPlayerId = playerId;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", playerId);
  }
}

function handleLineupDragEnd() {
  draggedLineupPlayerId = null;
  document.querySelectorAll(".lineup-spot.is-drag-over").forEach((spot) => spot.classList.remove("is-drag-over"));
}

function handleLineupDrop(event) {
  event.preventDefault();
  const playerId = event.dataTransfer.getData("text/plain") || draggedLineupPlayerId;
  const spotId = event.currentTarget.dataset.spotId;
  event.currentTarget.classList.remove("is-drag-over");
  draggedLineupPlayerId = null;

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
    attendance[String(round)][gameUnavailableSession] = attendance[String(round)][gameUnavailableSession].filter((id) => id !== playerId);

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
      gameAvailabilityCell(player.id),
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

function gameAvailabilityCell(playerId) {
  const available = hasAttendance(playerId, selectedRound, "game");
  const unavailable = hasAttendance(playerId, selectedRound, gameUnavailableSession);
  const cell = tableCell(available ? "Available" : unavailable ? "Not available" : "", "Game Day");
  cell.classList.toggle("is-yes", available);
  cell.classList.toggle("is-no", unavailable);
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
  let syncPromise;

  if (existingIndex >= 0) {
    list.splice(existingIndex, 1);
    syncPromise = deleteCloudAttendance(playerId, round, session);
  } else {
    list.push(playerId);
    syncPromise = upsertCloudAttendance([{ playerId, round, session }]);
  }

  saveAttendance();
  render();
  await syncPromise;
}

async function setGameAvailability(playerId, status) {
  const round = attendance[String(selectedRound)];
  const availableList = round.game;
  const unavailableList = round[gameUnavailableSession];
  const availableIndex = availableList.indexOf(playerId);
  const unavailableIndex = unavailableList.indexOf(playerId);
  const syncTasks = [];

  if (status === "available") {
    if (availableIndex >= 0) {
      availableList.splice(availableIndex, 1);
      syncTasks.push(deleteCloudAttendance(playerId, selectedRound, "game"));
    } else {
      availableList.push(playerId);
      if (unavailableIndex >= 0) {
        unavailableList.splice(unavailableIndex, 1);
        syncTasks.push(deleteCloudAttendance(playerId, selectedRound, gameUnavailableSession));
      }
      syncTasks.push(upsertCloudAttendance([{ playerId, round: selectedRound, session: "game" }]));
    }
  }

  if (status === "unavailable") {
    if (unavailableIndex >= 0) {
      unavailableList.splice(unavailableIndex, 1);
      syncTasks.push(deleteCloudAttendance(playerId, selectedRound, gameUnavailableSession));
    } else {
      unavailableList.push(playerId);
      if (availableIndex >= 0) {
        availableList.splice(availableIndex, 1);
        syncTasks.push(deleteCloudAttendance(playerId, selectedRound, "game"));
      }
      syncTasks.push(upsertCloudAttendance([{ playerId, round: selectedRound, session: gameUnavailableSession }]));
    }
  }

  saveAttendance();
  render();
  await Promise.all(syncTasks);
}

function markAttendance(playerId, round, session) {
  const list = attendance[String(round)][session];
  if (!list.includes(playerId)) {
    list.push(playerId);
    if (session === "game") {
      attendance[String(round)][gameUnavailableSession] = attendance[String(round)][gameUnavailableSession]
        .filter((id) => id !== playerId);
    }
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
  if (selectedSession === "game") {
    await Promise.all(newMarks.map((mark) => deleteCloudAttendance(mark.playerId, mark.round, gameUnavailableSession)));
  }
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

  let results;

  try {
    results = await Promise.all([
      fetchCloudPlayers(),
      cloudClient
        .from("attendance")
        .select("player_id,round,session")
        .eq("team_id", teamId),
      cloudClient
        .from("lineups")
        .select("round,spot_id,player_id")
        .eq("team_id", teamId),
      fetchCloudFixtures()
    ]);
  } catch (error) {
    syncStatus.textContent = `Cloud load failed: ${error.message || error}`;
    render();
    return false;
  }

  const [
    { data: cloudPlayers = [], error: playersError },
    { data: cloudAttendance = [], error: attendanceError },
    { data: cloudLineups = [], error: lineupsError },
    { data: cloudFixtures = [], error: fixturesError }
  ] = results;

  if (playersError || attendanceError) {
    syncStatus.textContent = `Cloud load failed: ${(playersError || attendanceError).message}`;
    render();
    return false;
  }

  if (cloudPlayers.length) {
    const localNicknames = new Map(players.map((player) => [player.id, player.nickname || ""]));
    const { players: uniqueCloudPlayers, idMap } = dedupePlayersByName(cloudPlayers);
    players = uniqueCloudPlayers.map((player) => ({
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
    attendance = rowsToAttendance(remapCloudPlayerRows(cloudAttendance || [], idMap, "player_id"));
    lineups = rowsToLineups(remapCloudPlayerRows(lineupsError ? [] : cloudLineups || [], idMap, "player_id"));
    if (!fixturesError && cloudFixtures?.length) {
      fixtures = cloudFixtures.map(rowToFixture);
    }
    normalizeAttendance();
    normalizeLineups();
    selectLatestRoundWithData();
    savePlayers();
    saveAttendance();
    saveLineups();
    saveFixtures();
    if (!fixturesError && !cloudFixtures?.length && fixtures.length) {
      await upsertCloudFixtures(fixtures);
    }
    renderRoundButtons();
    render();
  } else {
    render();
  }

  syncStatus.textContent = lineupsError || fixturesError
    ? `Synced ${players.length} players. Run the latest SQL upgrades to sync lineups and fixtures.`
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

async function fetchCloudFixtures() {
  if (!cloudFixturesAvailable) return { data: [], error: null };

  const result = await cloudClient
    .from("fixtures")
    .select("id,round,date,time,team,opponent,venue,notes")
    .eq("team_id", teamId)
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (result.error && isMissingFixturesTable(result.error)) {
    cloudFixturesAvailable = false;
    return { data: [], error: result.error };
  }

  return result;
}

function rowToFixture(row) {
  return {
    id: row.id,
    round: row.round || "",
    date: row.date,
    time: row.time?.slice(0, 5) || "",
    team: row.team,
    opponent: row.opponent,
    venue: row.venue,
    notes: row.notes || ""
  };
}

function isMissingFixturesTable(error) {
  return error.message?.toLowerCase().includes("fixtures") || error.details?.toLowerCase().includes("fixtures");
}

async function syncLocalToCloud() {
  if (!currentUser) return;

  ensureCloudSafePlayerIds();
  await mergeExistingCloudPlayers();
  await upsertCloudPlayers(players);
  await upsertCloudAttendance(attendanceToRows());
  await upsertCloudLineups(lineupsToRows());
  await upsertCloudFixtures(fixtures);
}

async function mergeExistingCloudPlayers() {
  const { data: cloudPlayers, error } = await fetchCloudPlayers();
  if (error || !cloudPlayers?.length) return;

  const cloudByName = new Map();
  dedupePlayersByName(cloudPlayers).players.forEach((player) => {
    cloudByName.set(normalizePlayerNameKey(player.name), player);
  });

  const idMap = new Map();
  players = players.map((player) => {
    const cloudPlayer = cloudByName.get(normalizePlayerNameKey(player.name));
    if (!cloudPlayer) return player;

    if (player.id !== cloudPlayer.id) {
      idMap.set(player.id, cloudPlayer.id);
    }

    return {
      ...player,
      id: cloudPlayer.id,
      name: cloudPlayer.name || player.name,
      nickname: cloudPlayer.nickname || player.nickname || "",
      number: cloudPlayer.number || player.number || "",
      position: cloudPlayer.position || player.position || "Utility",
      status: cloudPlayer.status || player.status || "Available",
      notes: cloudPlayer.notes || player.notes || ""
    };
  });

  remapLocalPlayerIds(idMap);
  savePlayers();
  saveAttendance();
  saveLineups();
}

function dedupePlayersByName(playerList) {
  const seen = new Map();
  const idMap = new Map();

  playerList.forEach((player) => {
    const key = normalizePlayerNameKey(player.name);
    if (!key || !seen.has(key)) {
      seen.set(key, player);
      return;
    }

    const keeper = seen.get(key);
    idMap.set(player.id, keeper.id);
    if (!keeper.nickname && player.nickname) keeper.nickname = player.nickname;
    if (!keeper.number && player.number) keeper.number = player.number;
    if ((!keeper.notes || keeper.notes.length < player.notes?.length) && player.notes) keeper.notes = player.notes;
  });

  return { players: [...seen.values()], idMap };
}

function remapCloudPlayerRows(rows, idMap, field) {
  if (!idMap.size) return rows;
  return rows.map((row) => ({ ...row, [field]: idMap.get(row[field]) || row[field] }));
}

function remapLocalPlayerIds(idMap) {
  if (!idMap.size) return;

  for (let round = 1; round <= roundCount; round += 1) {
    sessions.forEach((session) => {
      attendance[String(round)][session] = [...new Set(attendance[String(round)][session].map((playerId) =>
        idMap.get(playerId) || playerId
      ))];
    });
    attendance[String(round)][gameUnavailableSession] = [...new Set(attendance[String(round)][gameUnavailableSession].map((playerId) =>
      idMap.get(playerId) || playerId
    ))];

    Object.keys(lineups[String(round)] || {}).forEach((spotId) => {
      const playerId = lineups[String(round)][spotId];
      lineups[String(round)][spotId] = idMap.get(playerId) || playerId;
    });
  }
}

function normalizePlayerNameKey(name) {
  return normalizeSpeechText(name).replaceAll(" ", "");
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
    attendance[String(round)][gameUnavailableSession] = attendance[String(round)][gameUnavailableSession].map((playerId) =>
      idMap.get(playerId) || playerId
    );

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

async function upsertCloudFixtures(fixtureList) {
  if (!currentUser || !cloudFixturesAvailable || !fixtureList.length) return;

  const payload = fixtureList.map((fixture) => ({
    id: fixture.id,
    team_id: teamId,
    user_id: currentUser.id,
    round: fixture.round || "",
    date: fixture.date,
    time: fixture.time || null,
    team: fixture.team,
    opponent: fixture.opponent,
    venue: fixture.venue,
    notes: fixture.notes || ""
  }));

  const { error } = await cloudClient.from("fixtures").upsert(payload);
  if (error) {
    if (isMissingFixturesTable(error)) {
      cloudFixturesAvailable = false;
      syncStatus.textContent = "Fixtures save locally. Run fixtures_upgrade.sql in Supabase to sync them.";
      return;
    }
    syncStatus.textContent = `Fixture sync failed: ${error.message}`;
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
    allAttendanceSessions.forEach((session) => {
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
    nextAttendance[String(round)] = { monday: [], thursday: [], game: [], [gameUnavailableSession]: [] };
  }

  rows.forEach((row) => {
    if (nextAttendance[String(row.round)]?.[row.session] && !nextAttendance[String(row.round)][row.session].includes(row.player_id)) {
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
  const header = ["player", "nickname", "round", "monday_training", "thursday_training", "game_day_available", "game_day_not_available", "notes"];
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
        hasAttendance(player.id, round, gameUnavailableSession) ? "Yes" : "",
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
