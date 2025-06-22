const sheetURL = "/api/sheet";
const tableParty = document.querySelector("#partyTable");
const tableBody = document.querySelector("#sheetTable tbody");
const updateTextParty = document.getElementById("partyText");
const updateText = document.getElementById("lastUpdate");
const fallbackImage = "./src/image/Poke_Ball_Sprite.png";
const toggleButton = document.getElementById("toggleTheme");
const seriesSelect = document.getElementById("series");

const customTextContent = {
  BW: `
    <h1>Black & White Series Rules</h1>
    <p>กติกาสำหรับ Black & White ...</p>
  `,
  P: `
    <h1>กติกาโปเกมอนสำหรับการจบเกม</h1>
      <h3><span class="emoji">🔰</span>โปเกมอนที่ใช้ในการจบเกม (ตัวประมูล / เสาหลัก)</h3>
      <ul>
        <li>
          <strong>โดเนทสูงสุดของตัวประมูล</strong>
          <br>
          มีสิทธิ์เลือกเปลี่ยน Starter เป็นตัวอื่นได้
        </li>
        <li>
          <strong>โปเกมอนเสาหลัก 3 ตัว</strong>
          <br>
          เมื่อมียอดโดเนทรวมครบ <strong>700 บาท</strong>
        </li>
      </ul>
      <p>หากมี <strong>โปเกมอนเสาหลักครบแล้ว</strong><br>
      โปเกมอนที่จะถูกสุ่มหลังจบยิมแต่ละแห่ง จะมีเพียง <strong>2 ตัวเท่านั้นต่อยิม</strong></p>
      <h2><span class="emoji">🎲</span>กฎการสุ่มในแต่ละยิม</h2>
      <ul>
        <li>ทุกโดเนท <strong>50 บาท</strong> เลือกโปเกมอนและได้รับสิทธิ์สุ่ม <strong>1 สิทธิ์</strong></li>
        <li>หากโดเนทครั้งเดียว <strong>200 บาท</strong> จะได้รับสิทธิ์เพิ่ม <strong>+1</strong> (รวมเป็น <strong>5 สิทธิ์</strong>)</li>
        <li>หากทีมยังไม่เต็ม โปเกมอนที่ได้รับการโดเนทจะ <strong>เข้าทีมทันที</strong></li>
      </ul>
      <p><strong>หากทีมเต็มแล้ว</strong> จะทำการสุ่มหลังจากจบยิม ดังนี้:</p>
      <ul>
        <li>เมื่อจบยิม โปเกมอนทุกตัวที่ยังไม่เข้าสู่เสาหลัก จะถูก <strong>สุ่มใหม่ทั้งหมด</strong></li>
        <li>ตัวที่มีสิทธิ์เยอะ มีโอกาสสูงที่จะถูกเลือกเข้าทีม</li>
        <li>แต่แม้มีแค่ <strong>1 สิทธิ์</strong> ก็มีโอกาสได้เข้าทีมเหมือนกัน! <strong><em>กาชาล้วน ๆ</em></strong></li>
      </ul>
      <p>ด้วยกติกานี้ เราจะอยู่กับสตรีมนี้กับยาว ๆ มาสนุกกัน!</p>
  `
};

function updateCustomText(series) {
  const customTextDiv = document.getElementById("customText");
  if (customTextDiv) {
    customTextDiv.innerHTML = customTextContent[series] || "";
  }
}

// Apply saved theme on page load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("night-mode");
  toggleButton.textContent = "☀️Mode";
} else {
  toggleButton.textContent = "🌙Mode";
}

// Restore saved series selection
const savedSeries = localStorage.getItem('selectedSeries');
if (savedSeries && seriesSelect) {
  seriesSelect.value = savedSeries;
}

// On page load (after restoring dropdown value)
updateCustomText(seriesSelect.value);

async function loadData() {
  try {
    // Get the selected value from the dropdown
    const selectedSeries = seriesSelect.value;
    console.log('Selected series:', selectedSeries);
    
    // Build the URL with the selected series as a query parameter
    const url = `${sheetURL}?value=${selectedSeries}`;
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url);
    const text = await response.text();

    if (!text) throw new Error("Invalid Google Sheet response format");
    console.log('Response received:', text.substring(0, 100) + '...');
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
        const cleanedName = pokemonName.toLowerCase().replace(/\s+/g, '');
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

    if (currentParty.length === 0){
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
      img.onerror = () => {
        img.onerror = null;
        img.src = fallbackImage;
      };
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

    // Calculate total donation
    let totalDonation = 0;
    rows.forEach(row => {
      const cols = row.c;
      const donate = parseFloat(cols[1]?.v || 0);
      totalDonation += donate;
    });

    // Update the totalDonate element
    const totalDonateElem = document.getElementById("totalDonate");
    if (totalDonateElem) {
      totalDonateElem.textContent = `${totalDonation.toLocaleString()} บาท`;
    }
  } catch (err) {
    console.error("Error loading Google Sheet:", err);
    updateText.textContent = "ไม่สามารถโหลดข้อมูลได้";
    updateTextParty.style.display = "none";
  }
}

loadData();
setInterval(loadData, 30000);

// Add event listener to series dropdown
if (seriesSelect) {
  seriesSelect.addEventListener('change', () => {
    console.log('Dropdown changed! New value:', seriesSelect.value);
    localStorage.setItem('selectedSeries', seriesSelect.value);
    loadData(); // Reload data when series selection changes
    updateCustomText(seriesSelect.value);
  });
  console.log('Event listener added to series dropdown');
} else {
  console.error('Cannot add event listener: series dropdown not found');
}

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

// Theme toggle logic
toggleButton.addEventListener("click", function () {
  document.body.classList.toggle("night-mode");

  let theme = "light";
  if (document.body.classList.contains("night-mode")) {
    theme = "dark";
    toggleButton.textContent = "☀️Mode";
  } else {
    toggleButton.textContent = "🌙Mode";
  }
  localStorage.setItem("theme", theme);
});
