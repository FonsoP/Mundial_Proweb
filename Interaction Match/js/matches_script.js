let leagueId = 1; // Cambia esto según el ID de la confederación que quieras usar
let allMatches = [];
let currentFilter = 'all';

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

async function obtenerDatosConfederacion() {
  const leagueApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/leagues/${leagueId}`;
  try {
    const leagueData = await fetchAPI(leagueApiUrl);
    const league = leagueData.league;
    document.getElementById('confederation-logo').src = league.logo;
    document.getElementById('confederation-name').innerText = league.name.es || league.name.en;
    document.getElementById('confederation-description').innerText = league.qualification_process.es.join(' ');

    allMatches = [];
    document.getElementById('match-date').innerHTML = ''; // Clear previous matches
    await obtenerDatosPartidos();
  } catch (error) {
    console.error('Error al obtener los datos de la confederación:', error);
  }
}

async function obtenerDatosPartidos() {
  const matchesApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/matches/${leagueId}`;
  
  if (leagueId === 6) { // Liga 6 es la UEFA
    const match_by_date = document.querySelector('#match-date');
    match_by_date.innerHTML = `
      <div class="alert alert-warning" role="alert">
        No hay datos disponibles para la UEFA.
      </div>
    `;
    return; // Detener el resto de la ejecución
  }

  try {
    const matchesData = await fetchAPI(matchesApiUrl);
    const matches = matchesData.matches;
    // Ordenar los partidos por fecha
    matches.sort((a, b) => new Date(a.date) - new Date(b.date));
    allMatches = matches;

    renderMatches(allMatches);
  } catch (error) {
    console.error('Error al obtener los datos de los partidos:', error);
  }
}

function renderMatches(filteredMatches) {
  const match_by_date = document.querySelector('#match-date');
  match_by_date.innerHTML = ''; // Clear previous matches

  filteredMatches.forEach(async match => {
    await obtenerDatosEquipo(match.hometeam_id, 'home', match);
    await obtenerDatosEquipo(match.awayteam_id, 'away', match);
    match_by_date.innerHTML += getMatchHTML(match, leagueId);
  });
}

async function obtenerDatosEquipo(teamId, teamType, match) {
  const teamApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/countries/${teamId}`;
  try {
    const teamData = await fetchAPI(teamApiUrl);
    const team = teamData.country;
    match[`${teamType}TeamName`] = team.name.es.common;
    match[`${teamType}TeamLogo`] = team.flags.png;
  } catch (error) {
    console.error(`Error al obtener los datos del equipo ${teamType}:`, error);
  }
}

function getMatchHTML(match, leagueId) {
  return `
    <div class="match shadow-card" style="border: 1px solid #ccc; margin-bottom: 10px; padding: 10px;">
      <div class="match-info">
        <h4 class="group fw-bold">${match.stage}</h4>
      </div>
      <div class="flags">
        <div class="home-flag">
          <img src="${match.homeTeamLogo}" alt="${match.homeTeamName}" class="flag" />
          <h3 class="home-team">${match.homeTeamName}</h3>
        </div>
        <span class="vs">VS</span>
        <div class="away-flag">
          <img src="${match.awayTeamLogo}" alt="${match.awayTeamName}" class="flag" />
          <h3 class="away-team">${match.awayTeamName}</h3>
        </div>
      </div>
      <div class="time-area">
        ${match.status === "Finished" ? `
          <div class="result">
            <h3 class="text-success fw-bold">${match.hometeam_score} - ${match.awayteam_score}</h4>
          </div>` : `
          <div class="time">
            <h4 class="month">${new Date(match.date).toLocaleString('default', { month: 'short' })}</h4>
            <h4 class="day">${new Date(match.date).toLocaleDateString('default', { weekday: 'short' })}</h4>
            <h4 class="date">${new Date(match.date).getDate()}</h4>
            <h4 class="match-time">${match.time}</h4>
          </div>
        `}
      </div>
      <button class="details-button btn btn-secondary fs-5 fw-bold" onclick="verDetalles(${match.id}, ${leagueId})">Ver Detalles</button>
    </div>
  `;
}

function verDetalles(matchId, leagueId) {
  console.log(`Match ID: ${matchId}, League ID: ${leagueId}`); // Imprimir el ID del partido para depuración
  window.location.href = `match_details.html?match_id=${matchId}&league_id=${leagueId}`;
}

document.getElementById('select-confederation').addEventListener('change', (event) => {
  leagueId = parseInt(event.target.value, 10);
  obtenerDatosConfederacion();
});

document.getElementById('filter-played').addEventListener('click', () => {
  currentFilter = 'played';
  renderMatches(allMatches.filter(match => match.status === "Finished"));
});

document.getElementById('filter-unplayed').addEventListener('click', () => {
  currentFilter = 'unplayed';
  renderMatches(allMatches.filter(match => match.status !== "Finished"));
});

obtenerDatosConfederacion();
