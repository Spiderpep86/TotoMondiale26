let dati = [];

// ============================
// GIOCATORI
// ============================
const giocatori = [
  "Michele B",
  "Carmine",
  "Michele L",
  "Michele C",
  "Lello",
  "Ciro",
  "Alfredo",
  "Marco",
  "Mario",
  "Vincenzo",
  "Tore",
  "Emanuele",
  "Claudio",
  "Peppe",
  "Diana",
  "Menzo",
  "Mister"
];

// ============================
// CARICA DATI
// ============================
async function caricaDati() {
  try {
    const response = await fetch("dati.json");
    dati = await response.json();
    init();
  } catch (err) {
    console.error("Errore caricamento dati.json:", err);
  }
}

// ============================
// CLASSIFICA
// ============================
function calcolaClassifica() {
  let classifica = {};

  giocatori.forEach(nome => {
    classifica[nome] = {
      nome,
      punti: 0,
      corretti: 0,
      errati: 0
    };
  });

  dati.forEach(partita => {
    const esito = partita.esito;
    const pronostici = partita.pronostici;

    const eventoTerminato = esito && esito !== "?";

    giocatori.forEach(g => {
      const scelta = pronostici[g];

      if (!scelta) return;

      // ❗ se evento NON terminato → non assegno punti
      if (!eventoTerminato) return;

      if (scelta === esito) {
        classifica[g].punti += 1;
        classifica[g].corretti += 1;
      } else {
        classifica[g].errati += 1;
      }
    });
  });

  return Object.values(classifica).sort((a, b) => b.punti - a.punti);
}

// ============================
// CLASSIFICA
// ============================
function renderClassifica() {
  const classifica = calcolaClassifica();
  const tbody = document.querySelector("#tabellaClassifica tbody");

  tbody.innerHTML = "";

  classifica.forEach((g, index) => {
    let medaglia = "";
    if (index === 0) medaglia = "🥇";
    else if (index === 1) medaglia = "🥈";
    else if (index === 2) medaglia = "🥉";

    const totale = g.corretti + g.errati;
    const perc = totale > 0 ? Math.round((g.corretti / totale) * 100) : 0;

    tbody.innerHTML += `
      <tr>
        <td>${medaglia} ${index + 1}</td>
        <td><b>${g.nome}</b></td>
        <td><b>${g.punti}</b></td>
        <td>${g.corretti}</td>
        <td>${g.errati}</td>
        <td>${perc}%</td>
      </tr>
    `;
  });
}

// ============================
// PRONOSTICI
// ============================
function renderPronostici() {
  const table = document.getElementById("tabellaPronostici");

  let html = `
    <tr>
      <th>Evento</th>
      <th>Esito</th>
      ${giocatori.map(g => `<th>${g}</th>`).join("")}
    </tr>
  `;

  dati.forEach(p => {
    html += `
      <tr>
        <td><b>${p.evento}</b></td>
        <td><b>${p.esito}</b></td>

        ${giocatori.map(g => {
          const scelta = p.pronostici[g];

          // ❗ EVENTO NON TERMINATO → niente colori
          if (!p.esito || p.esito === "?") {
            return `<td>${scelta || "-"}</td>`;
          }

          return `
            <td class="${getClass(scelta, p.esito)}">
              ${scelta || "-"}
            </td>
          `;
        }).join("")}
      </tr>
    `;
  });

  table.innerHTML = html;
}

// ============================
// COLORI
// ============================
function getClass(pronostico, esito) {
  if (!esito || esito === "?") return "";
  return pronostico === esito ? "corretto" : "errato";
}

// ============================
// STATISTICHE
// ============================
function renderStats() {
  const eventi = dati.length;
  const conclusi = dati.filter(d => d.esito && d.esito !== "?").length;

  document.getElementById("totGiocatori").innerText = giocatori.length;
  document.getElementById("totEventi").innerText = eventi;
  document.getElementById("conclusi").innerText = conclusi;
  document.getElementById("attesa").innerText = eventi - conclusi;
}

// ============================
// INIT
// ============================
function init() {
  renderClassifica();
  renderPronostici();
  renderStats();
}

// AVVIO
caricaDati();