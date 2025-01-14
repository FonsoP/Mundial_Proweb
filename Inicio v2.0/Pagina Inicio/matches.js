async function obtenerProximosPartidos() {
    const matchesApiUrl = 'https://wc-qualifications-api-production.up.railway.app/api/v1/matches';
    try {
      const matchesData = await fetchAPI(matchesApiUrl);
      const matches = matchesData.matches;
      // Ordenar los partidos por fecha y filtrar los próximos 6 partidos
      const upcomingMatches = matches.filter(match => new Date(match.date) > new Date()).slice(0, 6);
      await addTeamDetails(upcomingMatches);
      renderMatches(upcomingMatches);
    } catch (error) {
      console.error('Error al obtener los próximos partidos:', error);
    }
  }
  
  async function addTeamDetails(matches) {
    for (let match of matches) {
      await obtenerDatosEquipo(match.hometeam_id, 'home', match);
      await obtenerDatosEquipo(match.awayteam_id, 'away', match);
    }
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
  
  function renderMatches(filteredMatches) {
    const matchesContainer = document.getElementById('matches-container');
    matchesContainer.innerHTML = ''; // Clear previous matches
  
    filteredMatches.forEach(match => {
      matchesContainer.innerHTML += getMatchHTML(match);
    });
  }
  
  function getMatchHTML(match) {
    return `
      <div class="match col-md-4">
        <div class="match-info">
          <h4 class="group">${match.stage}</h4>
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
              <h4>${match.hometeam_score} - ${match.awayteam_score}</h4>
            </div>` : `
            <div class="time">
              <h4 class="month">${new Date(match.date).toLocaleString('default', { month: 'short' })}</h4>
              <h4 class="day">${new Date(match.date).toLocaleDateString('default', { weekday: 'short' })}</h4>
              <h4 class="date">${new Date(match.date).getDate()}</h4>
              <h4 class="match-time">${match.time}</h4>
            </div>
          `}
        </div>
        <button class="details-button" onclick="verDetalles(${match.id})">Ver Detalles</button>
      </div>
    `;
  }
  
  function verDetalles(matchId) {
    console.log(`Match ID: ${matchId}`); // Imprimir el ID del partido para depuración
    window.location.href = `match_details.html?match_id=${matchId}`;
  }
  
  /* Reutilización de la función fetchAPI */
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
  
  /* Inicializar al cargar la página */
  document.addEventListener("DOMContentLoaded", obtenerProximosPartidos);
  