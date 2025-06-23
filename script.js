let workMinutes = 25;
let breakMinutes = 5;
let isRunning = false;
let isWorkTime = true;
let timerInterval;
let cycleCount = 0;

function updateDisplay(totalSeconds) {
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  const digits = {
    minTens: Math.floor(minutes / 10),
    minOnes: minutes % 10,
    secTens: Math.floor(seconds / 10),
    secOnes: seconds % 10
  };
  for (let id in digits) {
    document.querySelector(`#${id} .digit-front`).textContent = digits[id];
  }
}

function updateStatus() {
  const statusText = isWorkTime ? "集中タイム ✍️" : "ブレイクタイム ☕️";
  document.getElementById("status").textContent = statusText;
}

function updateCycleCount() {
  document.getElementById("cycle-count").textContent = `サイクル数：${cycleCount}回`;
}

function logCycleTime() {
  const now = new Date();
  const logEntry = document.createElement("li");
  logEntry.textContent = `${now.toLocaleDateString()} ${now.toLocaleTimeString()} にサイクル完了`;
  document.getElementById("cycle-log").appendChild(logEntry);

  let logs = JSON.parse(localStorage.getItem("cycleLogs") || "[]");
  logs.push(logEntry.textContent);
  localStorage.setItem("cycleLogs", JSON.stringify(logs));
}

function loadCycleLog() {
  const logs = JSON.parse(localStorage.getItem("cycleLogs") || "[]");
  const logList = document.getElementById("cycle-log");
  logList.innerHTML = "";
  logs.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = entry;
    logList.appendChild(li);
  });
}

function dailyResetCheck() {
  const lastDate = localStorage.getItem("lastUsedDate");
  const today = new Date().toLocaleDateString();
  if (lastDate !== today) {
    localStorage.setItem("lastUsedDate", today);
    localStorage.setItem("cycleLogs", "[]");
    cycleCount = 0;
    updateCycleCount();
  }
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  let totalSeconds = (isWorkTime ? workMinutes : breakMinutes) * 60;

  updateDisplay(totalSeconds);
  updateStatus();

  timerInterval = setInterval(() => {
    totalSeconds--;
    if (totalSeconds < 0) {
      clearInterval(timerInterval);
      if (isWorkTime) {
        cycleCount++;
        updateCycleCount();
        logCycleTime();
      }
      isWorkTime = !isWorkTime;
      isRunning = false;
      updateStatus();
      startTimer();
    } else {
      updateDisplay(totalSeconds);
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  isWorkTime = true;
  cycleCount = 0;
  updateStatus();
  updateCycleCount();
  updateDisplay(workMinutes * 60);
  localStorage.setItem("cycleLogs", "[]");
  loadCycleLog();
}

document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("reset").addEventListener("click", resetTimer);

// 初期表示
dailyResetCheck();
loadCycleLog();
updateStatus();
updateDisplay(workMinutes * 60);
updateCycleCount();
function downloadCycleLogAsCSV() {
  const logs = JSON.parse(localStorage.getItem("cycleLogs") || "[]");
  if (logs.length === 0) {
    alert("履歴が存在しません。");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,No,日時\n";
  logs.forEach((entry, index) => {
    csvContent += `${index + 1},"${entry}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "pomodoro_cycles.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.getElementById("download-csv").addEventListener("click", downloadCycleLogAsCSV);
