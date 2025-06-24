let workDuration = 25 * 60;
let breakDuration = 5 * 60;
let isWork = true;
let timeLeft = workDuration;
let timerInterval;
let cycleCount = 0;

function getTodayKey() {
  const now = new Date();
  return now.toISOString().slice(0, 10); // 例: "2025-06-24"
}

function loadLogs() {
  const allData = JSON.parse(localStorage.getItem("pomodoroDailyLogs") || "{}");
  const today = getTodayKey();
  if (!allData[today]) {
    allData[today] = { logs: [], count: 0 };
    localStorage.setItem("pomodoroDailyLogs", JSON.stringify(allData));
  }
  return allData;
}

function saveLogs(allData) {
  localStorage.setItem("pomodoroDailyLogs", JSON.stringify(allData));
}

function logCycle(status) {
  const now = new Date();
  const timestamp = now.toLocaleString();
  const today = getTodayKey();

  const allData = loadLogs();
  allData[today].count += 1;
  const cycleNum = allData[today].count;
  const entry = `サイクル${cycleNum}：${timestamp}：${status}終了`;
  allData[today].logs.unshift(entry);
  saveLogs(allData);

  updateLogDisplay(allData[today].logs);
}

function updateLogDisplay(logs) {
  const logList = document.getElementById("logList");
  logList.innerHTML = "";
  logs.forEach(log => {
    const li = document.createElement("li");
    li.textContent = log;
    logList.appendChild(li);
  });
}

function startPomodoro() {
  clearInterval(timerInterval);
  const allData = loadLogs();
  const today = getTodayKey();
  cycleCount = allData[today].count;

  updateLogDisplay(allData[today].logs);
  updateDigits(timeLeft);

  timerInterval = setInterval(() => {
    timeLeft--;

    if (timeLeft < 0) {
      logCycle(isWork ? "作業" : "休憩");
      alert(isWork ? "休憩へ移ります" : "作業に戻ります");

      isWork = !isWork;
      timeLeft = isWork ? workDuration : breakDuration;
      document.getElementById("status").textContent = isWork ? "作業中" : "休憩中";
    }

    updateDigits(timeLeft);
  }, 1000);
}

function updateDigits(time) {
  const min = Math.floor(time / 60);
  const sec = time % 60;

  document.getElementById("minTens").textContent = Math.floor(min / 10);
  document.getElementById("minOnes").textContent = min % 10;
  document.getElementById("secTens").textContent = Math.floor(sec / 10);
  document.getElementById("secOnes").textContent = sec % 10;
}
document.getElementById("download-csv").addEventListener("click", function () {
  const logData = JSON.parse(localStorage.getItem("pomodoroLog") || "{}");

  if (Object.keys(logData).length === 0) {
    alert("ログがありません。");
    return;
  }

  let csvContent = "日付,ログ\n";

  for (const [date, entry] of Object.entries(logData)) {
    (entry.logs || []).forEach(log => {
      csvContent += `${date},"${log}"\n`;
    });
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "pomodoro_log.csv";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});
