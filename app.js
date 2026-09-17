const TIMER_KEY = "meditationRecords";
const FEED_KEY = "meditationFeed";

const display = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const saveBtn = document.getElementById("save-btn");
const recordsList = document.getElementById("records-list");
const newsfeedForm = document.getElementById("newsfeed-form");
const newsfeedInput = document.getElementById("newsfeed-input");
const newsfeedList = document.getElementById("newsfeed-list");

let elapsedSeconds = 0;
let intervalId = null;

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function setDisplay() {
  display.textContent = formatTime(elapsedSeconds);
}

function loadItems(key) {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveItems(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

function renderList(target, items, formatter) {
  target.textContent = "";
  if (items.length === 0) {
    const item = document.createElement("li");
    item.textContent = "No entries yet.";
    target.appendChild(item);
    return;
  }

  items.forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = formatter(entry);
    target.appendChild(item);
  });
}

function refreshRecords() {
  const records = loadItems(TIMER_KEY);
  renderList(recordsList, records, (entry) => `${entry.duration} • ${entry.timestamp}`);
}

function refreshFeed() {
  const feedItems = loadItems(FEED_KEY);
  renderList(newsfeedList, feedItems, (entry) => `${entry.text} • ${entry.timestamp}`);
}

startBtn.addEventListener("click", () => {
  if (intervalId) {
    return;
  }

  intervalId = setInterval(() => {
    elapsedSeconds += 1;
    setDisplay();
  }, 1000);
});

pauseBtn.addEventListener("click", () => {
  if (!intervalId) {
    return;
  }

  clearInterval(intervalId);
  intervalId = null;
});

resetBtn.addEventListener("click", () => {
  elapsedSeconds = 0;
  setDisplay();
});

saveBtn.addEventListener("click", () => {
  if (elapsedSeconds === 0) {
    return;
  }

  const records = loadItems(TIMER_KEY);
  records.unshift({
    duration: formatTime(elapsedSeconds),
    timestamp: new Date().toLocaleString(),
  });
  saveItems(TIMER_KEY, records);
  refreshRecords();
});

newsfeedForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = newsfeedInput.value.trim();
  if (!text) {
    return;
  }

  const feedItems = loadItems(FEED_KEY);
  feedItems.unshift({
    text,
    timestamp: new Date().toLocaleString(),
  });
  saveItems(FEED_KEY, feedItems);
  newsfeedInput.value = "";
  refreshFeed();
});

setDisplay();
refreshRecords();
refreshFeed();
