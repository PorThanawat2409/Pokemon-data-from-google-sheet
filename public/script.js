const sheetURL = "/api/sheet";
const tableBody = document.querySelector("#sheetTable tbody");
const updateText = document.getElementById("lastUpdate");
const fallbackImage = "./src/image/Poke_Ball_Sprite.png";

async function loadData() {
  try {
    const response = await fetch(sheetURL);
    const text = await response.text();

    // Safely extract JSON from function-wrapped response

    if (!text) throw new Error("Invalid Google Sheet response format");
    console.log(text)
    const json = JSON.parse(text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1));
    const rows = json.table.rows;

    tableBody.innerHTML = "";


    rows.forEach(row => {
      const cols = row.c;
      const name = cols[0]?.v || "";
      const donate = cols[1]?.v || 0;
      const chance = cols[2]?.v || 0;
      const pokemonName = cols[3]?.v || "";
      
      console.log(pokemonName);

      let imageUrl;
      if (pokemonName) {
        const cleanedName = pokemonName.toLowerCase().replace(/\s+/g, '');
        imageUrl = `https://img.pokemondb.net/artwork/large/${cleanedName}.jpg`;
      } else {
        imageUrl = fallbackImage;
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

      const img = tr.querySelector("img");
      img.onerror = () => {
        img.onerror = null;
        img.src = fallbackImage;
      };

      tableBody.appendChild(tr);
    });

    const now = new Date();
    updateText.textContent = `อัปเดตล่าสุด: ${now.toLocaleTimeString()}`;
  } catch (err) {
    console.error("Error loading Google Sheet:", err);
    updateText.textContent = "ไม่สามารถโหลดข้อมูลได้";
  }
}

loadData();
setInterval(loadData, 180000);