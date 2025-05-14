const sheetURL = "/api/sheet";
const tableParty = document.querySelector("#partyTable");
const tableBody = document.querySelector("#sheetTable tbody");
const updateTextParty = document.getElementById("partyText");
const updateText = document.getElementById("lastUpdate");
const fallbackImage = "./src/image/Poke_Ball_Sprite.png";
const toggleButton = document.getElementById("toggleTheme");

async function loadData() {
  try {
    const response = await fetch(sheetURL);
    const text = await response.text();

    if (!text) throw new Error("Invalid Google Sheet response format");
    console.log(text)
    const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const rows = json.table.rows;

    tableParty.innerHTML = "";
    tableBody.innerHTML = "";

    const currentParty = [];

    rows.forEach(row => {
      const cols = row.c;
      const name = cols[0]?.v || "";
      const donate = cols[1]?.v || 0;
      const chance = cols[2]?.v || 0;
      const pokemonName = cols[3]?.v || "";
      const inparty = cols[4]?.v || false;

      let imageUrl;
      if (pokemonName) {
        let cleanedName = pokemonName.toLowerCase().replace(/\s+/g, '');
        cleanedName = cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
        imageUrl = `./src/image/Pokemon/${cleanedName}.png`;
        // imageUrl = `https://img.pokemondb.net/artwork/large/${cleanedName}.jpg`;
      } else {
        imageUrl = fallbackImage;
      }

      if (inparty==true){
        currentParty.push({ name: name, image: imageUrl, donate: donate });
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="text-align: center;">
          <img 
            src="${imageUrl}" 
            alt="${pokemonName || 'Poké Ball'}" 
            style="max-height: 60px; height: auto;" 
          >
        </td>
        <td>${name}</td>
        <td>${donate}</td>
        <td>${chance}</td>
      `;
      const donateCell = tr.children[2];
      const amount = parseFloat(donate);

      donateCell.style.fontWeight = "bold";
      donateCell.style.textAlign = "center";

      if (amount >= 2000) {
        donateCell.style.backgroundColor = "#ffcdd2"; // pastel red
        donateCell.style.color = "#b71c1c";
      } else if (amount >= 1000) {
        donateCell.style.backgroundColor = "#ffe0b2"; // pastel orange
        donateCell.style.color = "#e65100";
      } else if (amount >= 500) {
        donateCell.style.backgroundColor = "#e1bee7"; // pastel purple
        donateCell.style.color = "#6a1b9a";
      } else if (amount >= 200) {
        donateCell.style.backgroundColor = "#bbdefb"; // pastel blue
        donateCell.style.color = "#0d47a1";
      } else if (amount >= 100) {
        donateCell.style.backgroundColor = "#b2dfdb"; // pastel cyan
        donateCell.style.color = "#00695c";
      } else if (amount >= 20) {
        donateCell.style.backgroundColor = "#c8e6c9"; // pastel green
        donateCell.style.color = "#2e7d32";
      } else {
        donateCell.style.backgroundColor = "#f5f5f5"; // light gray
        donateCell.style.color = "#333";
      }


      const img = tr.querySelector("img");
      img.onerror = () => {
        img.onerror = null;
        img.src = fallbackImage;
      };


      tableBody.appendChild(tr);
    });

    if (currentParty.length === 1){
      tableParty.style.display = "none";
      updateTextParty.style.display = "none";
      // const party = document.createElement("p");
      // party.textContent = "ไม่สามารถโหลดข้อมูลได้";
      // tableParty.appendChild(party);
    }

    const nameRow = document.createElement("tr");
    const imageRow = document.createElement("tr");
    const donateRow = document.createElement("tr");

    currentParty.forEach(pokemon => {
      const nameCell = document.createElement("td");
      nameCell.textContent = pokemon.name;
      nameCell.style.textAlign = "center";

      nameRow.appendChild(nameCell);

      const imgCell = document.createElement("td");
      imgCell.id = "img";
      // imgCell.style.width = "120px";
      // imgCell.style.height = "120px";
      imgCell.style.textAlign = "center";

      const img = document.createElement("img");
      img.src = pokemon.image;
      img.alt = pokemon.name || "Pokémon";
      // img.style.width = "40%";
      // img.style.height = "5%";

      imgCell.appendChild(img);
      imageRow.appendChild(imgCell);

      const donateCell = document.createElement("td"); 
      donateCell.textContent = pokemon.donate;
      donateCell.style.textAlign = "center";
      
      donateRow.appendChild(donateCell);

    });

    tableParty.appendChild(nameRow);
    tableParty.appendChild(imageRow);
    tableParty.appendChild(donateRow);


    const now = new Date();
    updateText.textContent = `อัปเดตล่าสุด: ${now.toLocaleTimeString()}`;
  } catch (err) {
    console.error("Error loading Google Sheet:", err);
    updateText.textContent = "ไม่สามารถโหลดข้อมูลได้";
    updateTextParty.style.display = "none";
  }
}

loadData();
setInterval(loadData, 60000);

let currentSort = { column: null, ascending: true };

document.querySelectorAll('#sheetTable thead th').forEach((th, index) => {
  th.style.cursor = "pointer";
  th.addEventListener('click', () => {
    sortTableByColumn(index);
  });
});

function sortTableByColumn(columnIndex) {
  const table = document.querySelector("#sheetTable tbody");
  const rows = Array.from(table.querySelectorAll("tr"));
  const isAscending = currentSort.column === columnIndex ? !currentSort.ascending : true;

  const sortedRows = rows.sort((a, b) => {
    const aText = a.children[columnIndex].textContent.trim();
    const bText = b.children[columnIndex].textContent.trim();

    // Try to parse as number, fallback to string
    const aVal = isNaN(aText) ? aText.toLowerCase() : parseFloat(aText);
    const bVal = isNaN(bText) ? bText.toLowerCase() : parseFloat(bText);

    if (aVal < bVal) return isAscending ? -1 : 1;
    if (aVal > bVal) return isAscending ? 1 : -1;
    return 0;
  });

  // Clear and re-append rows
  table.innerHTML = '';
  sortedRows.forEach(row => table.appendChild(row));

  currentSort = { column: columnIndex, ascending: isAscending };
}

// document.getElementById("toggleTheme").addEventListener("click", () => {
//   document.body.classList.toggle("night-mode");
// });

toggleButton.addEventListener("click", function () {
  document.body.classList.toggle("night-mode");

  // Toggle icon
  if (document.body.classList.contains("night-mode")) {
      toggleButton.textContent = "☀️Mode";
  } else {
      toggleButton.textContent = "🌙Mode";
  }
});
