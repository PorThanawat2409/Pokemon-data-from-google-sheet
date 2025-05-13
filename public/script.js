const sheetURL = "/api/sheet";
const tableParty = document.querySelector("#partyTable");
const tableBody = document.querySelector("#sheetTable tbody");
const updateTextParty = document.getElementById("partyText");
const updateText = document.getElementById("lastUpdate");
const fallbackImage = "./src/image/Poke_Ball_Sprite.png";

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
        const cleanedName = pokemonName.toLowerCase().replace(/\s+/g, '');
        imageUrl = `https://img.pokemondb.net/artwork/large/${cleanedName}.jpg`;
      } else {
        imageUrl = fallbackImage;
      }

      if (inparty==true){
        currentParty.push({ name: name, image: imageUrl });
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

    if (currentParty.length === 1){
      tableParty.style.display = "none";
      updateTextParty.style.display = "none";
      // const party = document.createElement("p");
      // party.textContent = "ไม่สามารถโหลดข้อมูลได้";
      // tableParty.appendChild(party);
    }

    const nameRow = document.createElement("tr");
    const imageRow = document.createElement("tr");

    currentParty.forEach(pokemon => {
      const nameCell = document.createElement("td");
      nameCell.textContent = pokemon.name;
      nameCell.style.textAlign = "center";

      nameRow.appendChild(nameCell);

      const imgCell = document.createElement("td");
      // imgCell.style.width = "120px";
      // imgCell.style.height = "120px";
      imgCell.style.textAlign = "center";

      const img = document.createElement("img");
      img.src = pokemon.image;
      img.alt = pokemon.name || "Pokémon";
      img.style.width = "40%";
      // img.style.height = "5%";

      imgCell.appendChild(img);
      imageRow.appendChild(imgCell);
    });

    tableParty.appendChild(nameRow);
    tableParty.appendChild(imageRow);


    const now = new Date();
    updateText.textContent = `อัปเดตล่าสุด: ${now.toLocaleTimeString()}`;
  } catch (err) {
    console.error("Error loading Google Sheet:", err);
    updateText.textContent = "ไม่สามารถโหลดข้อมูลได้";
    updateTextParty.style.display = "none";
  }
}

loadData();
setInterval(loadData, 180000);