const sheetURL = "/api/sheet";
const tableBody = document.querySelector("#sheetTable tbody");
const updateText = document.getElementById("lastUpdate");
const fallbackImage = "./src/image/Poke_Ball_Sprite.png";
const toggleButton = document.getElementById("toggleTheme");
const searchInput = document.getElementById("searchInput");
const partySlotsEl = document.getElementById("partySlots");
const totalDonateEl = document.getElementById("totalDonate");
const partyText = document.getElementById("partyText");

// ─── Theme ───────────────────────────────────────────────
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.body.classList.remove("night-mode");
  document.body.classList.add("light-mode");
  toggleButton.textContent = "☀️ Light";
} else {
  document.body.classList.add("night-mode");
  toggleButton.textContent = "🌙 Dark";
}

toggleButton.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light-mode");
  document.body.classList.toggle("night-mode", !isLight);
  toggleButton.textContent = isLight ? "☀️ Light" : "🌙 Dark";
  localStorage.setItem("theme", isLight ? "light" : "dark");
});

// ─── Sort state ───────────────────────────────────────────
let currentSort = JSON.parse(localStorage.getItem("tableSort")) || { column: null, ascending: false };



// ─── Tier helper ─────────────────────────────────────────
function getTier(amount) {
  if (amount >= 2000) return { cls: "tier-legendary", max: 5000 };
  if (amount >= 1000) return { cls: "tier-epic",      max: 2000 };
  if (amount >= 500)  return { cls: "tier-rare",      max: 1000 };
  if (amount >= 200)  return { cls: "tier-uncommon",  max: 500  };
  if (amount >= 100)  return { cls: "tier-common",    max: 200  };
  if (amount >= 20)   return { cls: "tier-basic",     max: 100  };
  return                     { cls: "tier-default",   max: 20   };
}

// ─── Load Data ───────────────────────────────────────────
async function loadData() {
  try {
    const response = await fetch(sheetURL);
    const text = await response.text();
    if (!text) throw new Error("Empty response");

    const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
    const rows = json.table.rows;

    const filteredRows = rows.filter(row => {
      const c = row.c;
      return !(c[0]?.v == null && c[1]?.v == null && c[2]?.v == null && c[3]?.v == null);
    });

    tableBody.innerHTML = "";
    partySlotsEl.innerHTML = "";

    const currentParty = [];
    let totalDonation = 0;

    // Compute sorted donate amounts for top-3 ranking
    const donateAmounts = filteredRows
      .map(r => parseFloat(r.c[1]?.v || 0))
      .sort((a, b) => b - a);
    const top1 = donateAmounts[0];
    const top2 = donateAmounts[1];
    const top3 = donateAmounts[2];

    filteredRows.forEach((row, idx) => {
      const cols = row.c;
      const name       = cols[0]?.v || "";
      const donate     = parseFloat(cols[1]?.v || 0);
      const chance     = cols[2]?.v ?? "";
      const pokemonName = cols[3]?.v || "";
      const inparty    = cols[4]?.v || false;

      totalDonation += donate;

      const cleanedName = pokemonName ? pokemonName.toLowerCase().replace(/\s+/g, "") : "";
      const imageUrl = pokemonName ? `./src/image/Pokemon/${cleanedName}.png` : fallbackImage;

      if (inparty === true) {
        currentParty.push({ name, image: imageUrl, donate });
      }

      // Build row
      const tier = getTier(donate);
      const pct = Math.min(100, Math.round((donate / tier.max) * 100));

      // Rank badge
      let rankClass = "";
      let rankBadge = "";
      if (donate === top1 && donate > 0) { rankClass = "rank-gold";   rankBadge = "🥇"; }
      else if (donate === top2 && donate > 0) { rankClass = "rank-silver"; rankBadge = "🥈"; }
      else if (donate === top3 && donate > 0) { rankClass = "rank-bronze"; rankBadge = "🥉"; }

      const tr = document.createElement("tr");
      if (rankClass) tr.classList.add(rankClass);
      tr.style.animationDelay = `${idx * 0.03}s`;

      tr.innerHTML = `
        <td>
          <div class="pokemon-cell">
            <img src="${imageUrl}" alt="${pokemonName || 'Poké Ball'}" loading="lazy">
            <span class="pokemon-name">${pokemonName}</span>
          </div>
        </td>
        <td>${rankBadge ? `<span class="rank-badge">${rankBadge}</span>` : ""}${name}</td>
        <td>
          <div class="donate-cell ${tier.cls}">
            <span class="donate-amount">${donate.toLocaleString()}</span>
            <div class="donate-bar"><div class="donate-bar-fill" style="width:${pct}%"></div></div>
          </div>
        </td>
        <td>${chance}</td>
      `;

      tr.querySelector("img").onerror = function () {
        this.onerror = null;
        this.src = fallbackImage;
      };

      tableBody.appendChild(tr);
    });

    // ─── Party Slots ───────────────────────────────────────
    if (currentParty.length > 0) {
      currentParty.forEach((poke, i) => {
        const slot = document.createElement("div");
        slot.className = "party-slot";
        slot.style.animationDelay = `${i * 0.08}s`;
        slot.innerHTML = `
          <img src="${poke.image}" alt="${poke.name}" loading="lazy">
          <span class="slot-name">${poke.name}</span>
          <span class="slot-donate">${poke.donate.toLocaleString()}฿</span>
        `;
        slot.querySelector("img").onerror = function () {
          this.onerror = null;
          this.src = fallbackImage;
        };
        partySlotsEl.appendChild(slot);
      });
    } else {
      // Empty slots placeholder
      for (let i = 0; i < 6; i++) {
        const slot = document.createElement("div");
        slot.className = "party-slot";
        slot.style.animationDelay = `${i * 0.06}s`;
        slot.innerHTML = `<img src="${fallbackImage}" alt="Empty slot">`;
        partySlotsEl.appendChild(slot);
      }
    }

    // ─── Totals & timestamp ────────────────────────────────
    if (totalDonateEl) totalDonateEl.textContent = `${totalDonation.toLocaleString()} บาท`;
    const now = new Date();
    updateText.textContent = `⏱ อัปเดตล่าสุด: ${now.toLocaleTimeString("th-TH")}`;

    // Restore sort
    if (currentSort.column !== null) {
      applySavedSort(currentSort.column, currentSort.ascending);
    }

    // Apply current search filter
    applySearch();

  } catch (err) {
    console.error("Error loading data:", err);
    updateText.textContent = "❌ ไม่สามารถโหลดข้อมูลได้";
  }
}

loadData();
setInterval(loadData, REFRESH_INTERVAL * 1000);

// ─── Live Search ─────────────────────────────────────────
function applySearch() {
  const query = (searchInput?.value || "").toLowerCase().trim();
  const rows = tableBody.querySelectorAll("tr");
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = query === "" || text.includes(query) ? "" : "none";
  });
}

if (searchInput) {
  searchInput.addEventListener("input", applySearch);
}

// ─── Sorting ─────────────────────────────────────────────
document.querySelectorAll("#sheetTable thead th").forEach((th, index) => {
  th.addEventListener("click", () => sortTableByColumn(index));
});

function updateHeaderIndicators(colIndex, asc) {
  document.querySelectorAll("#sheetTable th").forEach(th => th.classList.remove("sort-asc", "sort-desc"));
  if (colIndex !== null && colIndex !== 0) {
    const th = document.querySelector(`#sheetTable th:nth-child(${colIndex + 1})`);
    if (th) th.classList.add(asc ? "sort-asc" : "sort-desc");
  }
}

function sortRows(rows, colIndex, ascending) {
  return rows.sort((a, b) => {
    const aRaw = a.children[colIndex]?.textContent.trim() ?? "";
    const bRaw = b.children[colIndex]?.textContent.trim() ?? "";
    const aVal = isNaN(aRaw) || aRaw === "" ? aRaw.toLowerCase() : parseFloat(aRaw);
    const bVal = isNaN(bRaw) || bRaw === "" ? bRaw.toLowerCase() : parseFloat(bRaw);
    if (aVal < bVal) return ascending ? -1 : 1;
    if (aVal > bVal) return ascending ? 1 : -1;
    return 0;
  });
}

function applySavedSort(colIndex, ascending) {
  if (colIndex === 0) return;
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  const sorted = sortRows(rows, colIndex, ascending);
  tableBody.innerHTML = "";
  sorted.forEach(r => tableBody.appendChild(r));
  updateHeaderIndicators(colIndex, ascending);
}

function sortTableByColumn(colIndex) {
  if (colIndex === 0) {
    currentSort = { column: null, ascending: false };
    localStorage.removeItem("tableSort");
    updateHeaderIndicators(null, false);
    loadData();
    return;
  }
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  const isAsc = currentSort.column === colIndex ? !currentSort.ascending : false;
  const sorted = sortRows(rows, colIndex, isAsc);
  tableBody.innerHTML = "";
  sorted.forEach(r => tableBody.appendChild(r));
  currentSort = { column: colIndex, ascending: isAsc };
  localStorage.setItem("tableSort", JSON.stringify(currentSort));
  updateHeaderIndicators(colIndex, isAsc);
}

// ─── Responsive layout (move aside) ──────────────────────
function moveCustomText() {
  const customText = document.getElementById("customText");
  const pokemonData = document.getElementById("pokemon_data");
  const partyCard   = document.querySelector(".party-card");
  const layoutGrid  = document.querySelector(".layout-grid");
  if (!customText || !pokemonData || !layoutGrid) return;

  if (window.innerWidth <= 1200) {
    if (customText.parentElement !== pokemonData) {
      pokemonData.insertBefore(customText, partyCard?.nextSibling ?? pokemonData.firstChild);
    }
  } else {
    if (customText.parentElement !== layoutGrid) {
      layoutGrid.appendChild(customText);
    }
  }
}

window.addEventListener("resize", moveCustomText);
document.addEventListener("DOMContentLoaded", moveCustomText);
