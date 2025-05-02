const sheetURL = "https://docs.google.com/spreadsheets/d/1hCx6kH4ttud8zMSSvmUJG-U6IQUS8ArzNja4zWal4_Q/gviz/tq?tqx=out:json";
const tableBody = document.querySelector("#sheetTable tbody");
const updateText = document.getElementById("lastUpdate");
const fallbackImage = "./src/image/Poke_Ball_Sprite.png";

function loadData() {
  fetch(sheetURL)
    .then(res => res.text())
    .then(text => {
      const json = JSON.parse(text.substr(47).slice(0, -2));
      const rows = json.table.rows;

      tableBody.innerHTML = "";

      rows.forEach(row => {
        const cols = row.c;
        const name = cols[0]?.v || "";
        const donate = cols[1]?.v || 0;
        const chance = cols[2]?.v || 0;
        const pokemonName = cols[3]?.v || "";

        console.log(pokemonName);
        // Determine image URL or fallback
        let imageUrl;
        if (pokemonName !== "") {
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

        // Add fallback handling if pokemonName is not null
        const img = tr.querySelector("img");
        if (pokemonName) {
          img.onerror = () => {
            img.onerror = null;
            img.src = fallbackImage;
          };
        }

        tableBody.appendChild(tr);
      });

      const now = new Date();
      updateText.textContent = `อัปเดตล่าสุด: ${now.toLocaleTimeString()}`;
    })
    .catch(err => {
      console.error("Error loading Google Sheet:", err);
      updateText.textContent = "ไม่สามารถโหลดข้อมูลได้";
    });
}

loadData();
setInterval(loadData, 60000); // Every 3 minutes