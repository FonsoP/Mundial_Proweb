const rankingAPI = 'https://wc-qualifications-api-production.up.railway.app/api/v1/ranking';
const countriesAPI = 'https://wc-qualifications-api-production.up.railway.app/api/v1/countries';
const leagueAPIBase = 'https://wc-qualifications-api-production.up.railway.app/api/v1/leagues/';

const itemsPerPage = 20; // Número de elementos a mostrar por página
let currentPage = 1; // Página actual de datos
let totalRankingData = []; // Almacenar todos los datos cargados
let allConfederations = []; // Lista de todas las confederaciones

// Función para obtener datos de la API
async function fetchAPI(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    throw error;
  }
}

// Función para cargar todos los datos de las confederaciones
async function loadConfederationData() {
  let confederationData = {};
  for (let i = 1; i <= 6; i++) {
    const leagueAPI = `${leagueAPIBase}${i}`;
    const leagueData = await fetchAPI(leagueAPI);
    confederationData[i] = leagueData.league;
    allConfederations.push(leagueData.league.alias);
  }
  return confederationData;
}

// Función para cargar todos los datos de una vez
async function loadAllRankingData(confederationData) {
  try {
    console.log("Fetching ranking data from:", rankingAPI);
    const rankingData = await fetchAPI(rankingAPI);
    console.log("Ranking data:", rankingData);

    console.log("Fetching countries data from:", countriesAPI);
    const countriesData = await fetchAPI(countriesAPI);
    console.log("Countries data:", countriesData);

    for (const item of rankingData.ranking) {
      const country = countriesData.countries.find(c => c.id === item.country_id);
      const league = confederationData[item.league_id];

      const row = {
        rank: item.rank,
        team: country ? country.name.en.common : 'Unknown',
        points: item.points,
        previousPoints: item.previous_points,
        upDown: item.rank - item.previous_rank,
        confederation: league && league.name && league.name.en ? league.name.en : 'Unknown',
        alias: league.alias
      };

      totalRankingData.push(row);
    }

    updateTable();
    updateConfederationOptions();
  } catch (error) {
    console.error("Error loading ranking data:", error);
  } finally {
    document.getElementById('spinner').style.display = 'none';
    document.getElementById('rankingTable').style.display = '';
    document.getElementById('loadMoreBtn').style.display = '';
  }
}

// Función para actualizar la tabla con los datos cargados
function updateTable() {
  const tableBody = document.querySelector('#rankingTable tbody');
  tableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos

  const start = (currentPage - 1) * itemsPerPage;
  const end = currentPage * itemsPerPage;
  const selectedConfederation = document.getElementById('confederationSelect').value;
  const filteredData = totalRankingData.filter(row => selectedConfederation === 'all' || row.alias === selectedConfederation);

  filteredData.slice(0, end).forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="rank">${row.rank}</td>
      <td class="team">${row.team}</td>
      <td class="points">${row.points}</td>
      <td class="previousPoints">${row.previousPoints}</td>
      <td class="up-down">${row.upDown}</td>
      <td class="confederation">${row.confederation}</td>
    `;
    tableBody.appendChild(tr);
  });

  // Ocultar el botón de cargar más si todos los datos están cargados
  if (end >= filteredData.length) {
    document.getElementById('loadMoreBtn').style.display = 'none';
  }
}

// Función para actualizar las opciones de confederaciones
function updateConfederationOptions() {
  const confederationSelect = document.getElementById('confederationSelect');
  confederationSelect.innerHTML = '<option value="all">All</option>'; // Reiniciar opciones
  allConfederations.forEach(confederation => {
    const option = document.createElement('option');
    option.value = confederation;
    option.textContent = confederation;
    confederationSelect.appendChild(option);
  });
}

// Evento para el selector de confederaciones
document.getElementById('confederationSelect').addEventListener('change', () => {
  currentPage = 1; // Reiniciar la página actual al cambiar la confederación
  updateTable();
});

// Evento para el botón de cargar más
document.querySelector('#loadMoreBtn').addEventListener('click', () => {
  currentPage++;
  updateTable();
});

// Cargar todos los datos iniciales
(async () => {
  document.getElementById('spinner').style.display = '';
  document.getElementById('rankingTable').style.display = 'none';
  document.getElementById('loadMoreBtn').style.display = 'none';

  const confederationData = await loadConfederationData();
  await loadAllRankingData(confederationData);
})();
