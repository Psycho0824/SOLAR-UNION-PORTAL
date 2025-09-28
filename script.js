// ===============================
// CSV Paths
// ===============================
const SHEET_URL_MONITORING = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRKqKRhG37hbJ7SUWExTejOgiwVuFOSnm2hevmZRxPpYLlAIC6IJEfgAbOt_MEYxiHElCiVkyEwBZ1h/pub?gid=1516931125&single=true&output=csv";
const SHEET_URL_OM = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRKqKRhG37hbJ7SUWExTejOgiwVuFOSnm2hevmZRxPpYLlAIC6IJEfgAbOt_MEYxiHElCiVkyEwBZ1h/pub?gid=511372399&single=true&output=csv";

// Chart instances
let dailyBarChart, statusDonutChartSmall, perfMiniLine;

// ===============================
// Load Monitoring Data
// ===============================
function loadMonitoringData() {
  Papa.parse(SHEET_URL_MONITORING, {
    download: true,
    header: true,
    complete: function(results) {
      const data = results.data.filter(r => r["DATE"]);
      const labels = data.map(r => r["DATE"]);
      const pvYield = data.map(r => parseFloat(r["PV YIELD"]) || 0);
      const percent = data.map(r => parseFloat(r["PERCENT"]) || 0);
      const remarks = data.map(r => r["REMARKS"]?.toUpperCase() || "");

      // Bar chart
      if (dailyBarChart) dailyBarChart.destroy();
      dailyBarChart = new Chart(document.getElementById("dailyBarChart"), {
        type: "bar",
        data: { labels, datasets: [{ label: "PV Yield", data: pvYield, backgroundColor: "#00e6b8" }] }
      });

      // Donut
      const counts = {
        Online: remarks.filter(r => r.includes("ONLINE")).length,
        Offline: remarks.filter(r => r.includes("OFFLINE")).length,
        Fault: remarks.filter(r => r.includes("FAULT")).length
      };
      if (statusDonutChartSmall) statusDonutChartSmall.destroy();
      statusDonutChartSmall = new Chart(document.getElementById("statusDonutChartSmall"), {
        type: "doughnut",
        data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: ["#22c55e","#ef4444","#f59e0b"] }] }
      });

      // Line performance
      if (perfMiniLine) perfMiniLine.destroy();
      perfMiniLine = new Chart(document.getElementById("perfMiniLine"), {
        type: "line",
        data: { labels, datasets: [{ label: "%", data: percent, borderColor: "#3b82f6", fill: false }] }
      });

      // Table
      const tbody = document.getElementById("monitoringTableBody");
      tbody.innerHTML = "";
      data.forEach(r => {
        tbody.innerHTML += `<tr>
          <td>${r["DATE"]}</td>
          <td>${r["SITENAME"]}</td>
          <td>${r["REALTIME"] || ""}</td>
          <td>${r["PV YIELD"]}</td>
          <td>${r["EXPECTED OUTPUT"]}</td>
          <td>${r["PERCENT"]}</td>
          <td>${r["REMARKS"]}</td>
        </tr>`;
      });

      // Summary counts
      document.getElementById("countOnline").textContent = counts.Online;
      document.getElementById("countOffline").textContent = counts.Offline;
      document.getElementById("countFault").textContent = counts.Fault;
    }
  });
}

// ===============================
// Load O&M Data
// ===============================
function loadOMData() {
  Papa.parse(SHEET_URL_OM, {
    download: true,
    header: true,
    complete: function(results) {
      const tbody = document.getElementById("omTableBody");
      tbody.innerHTML = "";

      results.data.forEach(r => {
        tbody.innerHTML += `<tr data-date="${r["COMPLETION DATE"] || ""}">
          <td>${r["SITE PLANT NAME"] || ""}</td>
          <td>${r["SYSTEM SIZE (kWp)"] || ""}</td>
          <td>${r["CATEGORY"] || ""}</td>
          <td>${r["AREA"] || ""}</td>
          <td>${r["ADDRESS"] || ""}</td>
          <td>${r["CONNECTION"] || ""}</td>
          <td>${r["PLANT TYPE"] || ""}</td>
          <td>${r["COMPLETION DATE"] || ""}</td>
          <td>${r["CONTACT PERSON"] || ""}</td>
          <td>${r["CONTACT DETAILS"] || ""}</td>
          <td>${r["EMAIL ADDRESS"] || ""}</td>
        </tr>`;
      });
    }
  });
}

// ===============================
// O&M Date Filter
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const omDateInput = document.getElementById("omDate");
  if (omDateInput) {
    omDateInput.addEventListener("change", function () {
      const selectedDate = this.value; // yyyy-mm-dd
      const tableRows = document.querySelectorAll("#omTableBody tr");

      tableRows.forEach(row => {
        const rowDate = row.getAttribute("data-date"); 
        if (!selectedDate || rowDate === selectedDate) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }
});

// ===============================
// Modal Logic (fixed)
// ===============================
document.querySelectorAll(".open-modal").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-target");
    const modal = document.getElementById(target);
    if (modal) {
      modal.style.display = "block";

      // Auto-load data if Monitoring modal is opened
      if (target === "monitoringModal") {
        loadMonitoringData();
        loadOMData();
      }
    }
  });
});

document.querySelectorAll(".closeModal").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.closest(".modal").style.display = "none";
  });
});

window.onclick = function(e) {
  if (e.target.classList.contains("modal")) e.target.style.display = "none";
};

// ===============================
// Tabs
// ===============================
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(tab).classList.add("active");
  });
});

// ===============================
// Templates PDF Viewer
// ===============================
document.querySelectorAll(".openTemplate").forEach(btn => {
  btn.addEventListener("click", () => {
    const pdf = btn.closest(".template-card").dataset.pdf;
    document.getElementById("pdfViewerEmbed").src = pdf;
    document.getElementById("pdfViewerModal").style.display = "block";
  });
});
document.getElementById("closePdfViewer").addEventListener("click", () => {
  document.getElementById("pdfViewerModal").style.display = "none";
});

// ===============================
// Modal Tabs Fix
// ===============================
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");

    // limit the scope to the modal where the button belongs
    const modal = btn.closest(".modal-content");
    modal.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    modal.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    modal.querySelector(`#${tab}`).classList.add("active");
  });
});

// ===============================
// Templates PDF Viewer Logic
// ===============================

// Toggle sub-list for multi-PDF template
document.querySelectorAll(".toggle-list").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const list = document.getElementById(targetId);
    if (list) {
      list.classList.toggle("hidden");
    }
  });
});

// Open PDF in modal
document.querySelectorAll(".open-pdf").forEach(item => {
  item.addEventListener("click", () => {
    const pdf = item.getAttribute("data-pdf");
    if (pdf) {
      document.getElementById("pdfViewerEmbed").src = pdf;
      document.getElementById("pdfViewerModal").style.display = "block";
    }
  });
});

// Close PDF modal
document.getElementById("closePdfViewer").addEventListener("click", () => {
  document.getElementById("pdfViewerModal").style.display = "none";
});


// ===============================
// TEMPLATE MODAL LOGIC
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const pdfViewerModal = document.getElementById("pdfViewerModal");
  const pdfViewerEmbed = document.getElementById("pdfViewerEmbed");
  const closePdfViewer = document.getElementById("closePdfViewer");

  // Handle single-PDF template cards
  document.querySelectorAll(".open-pdf").forEach(el => {
    el.addEventListener("click", () => {
      const pdfPath = el.getAttribute("data-pdf");

      if (pdfPath) {
        pdfViewerEmbed.src = pdfPath;
        pdfViewerModal.style.display = "block";
      }
    });
  });

  // Handle toggling lists for multi-PDF templates
  document.querySelectorAll(".toggle-list").forEach(el => {
    el.addEventListener("click", () => {
      const targetId = el.getAttribute("data-target");
      const list = document.getElementById(targetId);
      if (list) {
        list.classList.toggle("hidden");
      }
    });
  });

  // Close PDF viewer
  closePdfViewer.addEventListener("click", () => {
    pdfViewerModal.style.display = "none";
    pdfViewerEmbed.src = ""; // clear PDF when closing
  });

  // Close PDF viewer if clicking outside modal content
  window.addEventListener("click", (e) => {
    if (e.target === pdfViewerModal) {
      pdfViewerModal.style.display = "none";
      pdfViewerEmbed.src = "";
    }
  });
});

// Toggle list when clicking a template card
document.querySelectorAll('.toggle-list').forEach(card => {
  card.addEventListener('click', () => {
    const targetId = card.getAttribute('data-target');
    const list = document.getElementById(targetId);
    list.classList.toggle('hidden');
  });
});
