let billings = [];
const billingList = document.getElementById("billingList");
const tableBody = document.getElementById("tableBody");

function addBilling() {
  const name = document.getElementById("psName").value.trim();
  const rate = parseInt(document.getElementById("rate").value);

  if (!name || !rate) return alert("Lengkapi nama dan harga per jam!");

  const billing = {
    name,
    rate,
    start: null,
    intervalId: null
  };

  billings.push(billing);
  renderBillingCard(billing);
}

function renderBillingCard(billing) {
  const card = document.createElement("div");
  card.className = "billing-card";
  card.id = `card-${billing.name}`;

  card.innerHTML = `
    <h4>${billing.name} (Rp ${billing.rate}/jam)</h4>
    <div><strong>Mulai:</strong> <span id="start-${billing.name}">-</span></div>
    <div><strong>Durasi:</strong> <span id="dur-${billing.name}">-</span></div>
    <div><strong>Biaya:</strong> <span id="cost-${billing.name}">-</span></div>
    <button onclick="start('${billing.name}')">Mulai</button>
    <button onclick="stop('${billing.name}')">Selesai</button>
  `;
  billingList.appendChild(card);
}

function start(name) {
  const billing = billings.find(b => b.name === name);
  if (!billing) return;
  billing.start = new Date();
  document.getElementById(`start-${name}`).textContent = billing.start.toLocaleTimeString();

  billing.intervalId = setInterval(() => {
    const now = new Date();
    const diffMs = now - billing.start;
    const dur = Math.floor(diffMs / 60000);
    const cost = Math.ceil((diffMs / 3600000) * billing.rate);

    document.getElementById(`dur-${name}`).textContent = `${dur} menit`;
    document.getElementById(`cost-${name}`).textContent = `Rp ${cost.toLocaleString("id-ID")}`;
  }, 1000);
}

function stop(name) {
  const billing = billings.find(b => b.name === name);
  if (!billing || !billing.start) return;

  clearInterval(billing.intervalId);
  const end = new Date();
  const dur = Math.floor((end - billing.start) / 60000);
  const cost = Math.ceil((end - billing.start) / 3600000 * billing.rate);

  const entry = {
    name: billing.name,
    start: billing.start.toLocaleTimeString(),
    end: end.toLocaleTimeString(),
    duration: `${dur} menit`,
    cost: `Rp ${cost.toLocaleString("id-ID")}`,
    date: new Date().toLocaleDateString()
  };

  saveToLocal(entry);
  addToTable(entry);

  billing.start = null;
  document.getElementById(`start-${name}`).textContent = "-";
  document.getElementById(`dur-${name}`).textContent = "-";
  document.getElementById(`cost-${name}`).textContent = "-";
}

function saveToLocal(entry) {
  const data = JSON.parse(localStorage.getItem("multiBillingData") || "[]");
  data.push(entry);
  localStorage.setItem("multiBillingData", JSON.stringify(data));
}

function loadData() {
  const data = JSON.parse(localStorage.getItem("multiBillingData") || "[]");
  const today = new Date().toLocaleDateString();
  data.filter(d => d.date === today).forEach(addToTable);
}

function addToTable(entry) {
  const row = document.createElement("tr");
  row.innerHTML = `<td>${entry.name}</td><td>${entry.start}</td><td>${entry.end}</td><td>${entry.duration}</td><td>${entry.cost}</td>`;
  tableBody.appendChild(row);
}

function exportExcel() {
  const table = document.getElementById("billingTable");
  const wb = XLSX.utils.table_to_book(table, { sheet: "Laporan" });
  XLSX.writeFile(wb, "Laporan_Billing.xlsx");
}

function clearToday() {
  localStorage.setItem("multiBillingData", "[]");
  tableBody.innerHTML = "";
}

window.onload = loadData;
