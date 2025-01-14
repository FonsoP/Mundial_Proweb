let leagueId = document.body.getAttribute('data-league');

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

function verDetalles(matchId, leagueId) {
  console.log(`Match ID: ${matchId}, League ID: ${leagueId}`); // Imprimir el ID del partido para depuración
  window.location.href = `match_details.html?match_id=${matchId}&league_id=${leagueId}`;
}

obtenerDatosConfederacion();
