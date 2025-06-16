let startTime;
const ratePerHour = 5000;

function startBilling() {
  startTime = new Date();
  document.getElementById("startTime").textContent = startTime.toLocaleTimeString();
  document.getElementById("billingBubble").classList.remove("hidden");
  document.getElementById("startBtn").style.display = "none";
  updateTimer();
}

function updateTimer() {
  const interval = setInterval(() => {
    if (!startTime) return clearInterval(interval);
    const now = new Date();
    const diff = (now - startTime) / 1000;
    const hours = diff / 3600;
    const dur = `${Math.floor(diff / 60)} menit`;
    const cost = Math.ceil(hours * ratePerHour);
    document.getElementById("duration").textContent = dur;
    document.getElementById("cost").textContent = cost.toLocaleString("id-ID");
  }, 1000);
}

function stopBilling() {
  const endTime = new Date();
  const durationMs = endTime - startTime;
  const hours = durationMs / 3600000;
  const duration = `${Math.floor(durationMs / 60000)} menit`;
  const cost = Math.ceil(hours * ratePerHour);

  const entry = {
    start: startTime.toLocaleTimeString(),
    end: endTime.toLocaleTimeString(),
    duration,
    cost: `Rp ${cost.toLocaleString("id-ID")}`,
    date: new Date().toLocaleDateString()
  };

  saveToLocal(entry);
  addToTable(entry);

  document.getElementById("billingBubble").classList.add("hidden");
  document.getElementById("startBtn").style.display = "inline-block";
  startTime = null;
}

function saveToLocal(entry) {
  const data = JSON.parse(localStorage.getItem("billingData") || "[]");
  data.push(entry);
  localStorage.setItem("billingData", JSON.stringify(data));
}

function loadData() {
  const data = JSON.parse(localStorage.getItem("billingData") || "[]");
  const today = new Date().toLocaleDateString();
  data.filter(d => d.date === today).forEach(addToTable);
}

function addToTable(entry) {
  const row = document.createElement("tr");
  row.innerHTML = `<td>${entry.start}</td><td>${entry.end}</td><td>${entry.duration}</td><td>${entry.cost}</td>`;
  document.getElementById("tableBody").appendChild(row);
}

function exportExcel() {
  const table = document.getElementById("billingTable");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Billing Hari Ini" });
  XLSX.writeFile(wb, "Laporan_Billing.xlsx");
}

async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text("Laporan Billing", 10, 10);
  const rows = [...document.querySelectorAll("#tableBody tr")].map(tr => {
    return [...tr.querySelectorAll("td")].map(td => td.innerText);
  });
  doc.autoTable({
    head: [["Mulai", "Selesai", "Durasi", "Biaya"]],
    body: rows
  });
  doc.save("Laporan_Billing.pdf");
}

function clearToday() {
  const data = JSON.parse(localStorage.getItem("billingData") || "[]");
  const today = new Date().toLocaleDateString();
  const filtered = data.filter(d => d.date !== today);
  localStorage.setItem("billingData", JSON.stringify(filtered));
  document.getElementById("tableBody").innerHTML = "";
  loadData();
}

window.onload = loadData;
