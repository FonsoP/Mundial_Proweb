document.getElementById('back-button').addEventListener('click', () => {
  window.location.href = '/Interaction Match/pages/matches.html';
});

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

async function obtenerDatosPartido() {
  const urlParams = new URLSearchParams(window.location.search);
  const matchId = urlParams.get('match_id');
  const leagueId = urlParams.get('league_id');
  console.log(`Match ID from URL: ${matchId}, League ID from URL: ${leagueId}`); // Imprimir los IDs para depuración
  const matchApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/matches/${leagueId}/${matchId}`;

  try {
    const matchData = await fetchAPI(matchApiUrl);
    const match = matchData.match;

    /* document.getElementById('match-status').innerText = match.status; */
    document.getElementById('match-date').innerText = `${match.date} at ${match.time}`;
    document.getElementById('hometeam-score').innerText = match.hometeam_score;
    document.getElementById('awayteam-score').innerText = match.awayteam_score;
    document.getElementById('match-referee').innerText = match.referee;

    await obtenerDatosEquipo(match.hometeam_id, 'home');
    await obtenerDatosEquipo(match.awayteam_id, 'away');
    await obtenerDatosLiga(match.league_id);

    const eventsList = document.getElementById('event-list');
    
    // Unir los eventos de tarjetas y goles
    const events = [
      ...match.cards.map(card => ({ ...card, type: 'card' })),
      ...match.goal_scorers.map(goal => ({ ...goal, type: 'goal' }))
    ];
    events.sort((a, b) => parseInt(a.time) - parseInt(b.time)); // Ordenar cronológicamente
    
    events.forEach(event => {
      const li = document.createElement('li');
      li.classList.add('event-item');
      if (event.type === 'card') {
        li.innerText = `${event.time}' - ${event.card} - ${event.player}`;
      } else if (event.type === 'goal') {
        li.innerText = `${event.time}' - Gol - ${event.player}`;
      }
      eventsList.appendChild(li);
    });

    const statsList = document.getElementById('stats-list');
    match.statistics.forEach(stat => {
      const dt = document.createElement('dt');
      dt.innerText = stat.type.es;
      const ddHome = document.createElement('dd');
      ddHome.classList.add('home');
      ddHome.innerText = stat.home;
      const ddAway = document.createElement('dd');
      ddAway.classList.add('away');
      ddAway.innerText = stat.away;
      statsList.appendChild(dt);
      statsList.appendChild(ddHome);
      statsList.appendChild(ddAway);
    });

    const homeLineup = document.getElementById('home-line-up');
    match.lineups.hometeam.starting_players.forEach(player => {
      const li = document.createElement('li');
      li.innerText = `${player.player_number} - ${player.player_name}`;
      homeLineup.appendChild(li);
    });

    const awayLineup = document.getElementById('away-line-up');
    match.lineups.awayteam.starting_players.forEach(player => {
      const li = document.createElement('li');
      li.innerText = `${player.player_number} - ${player.player_name}`;
      awayLineup.appendChild(li);
    });

  } catch (error) {
    console.error('Error al obtener los datos del partido:', error);
  }
}

async function obtenerDatosEquipo(teamId, teamType) {
  const teamApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/countries/${teamId}`;
  try {
    const teamData = await fetchAPI(teamApiUrl);
    const team = teamData.country;

    document.getElementById(`${teamType}team-name`).innerText = team.name.es.common;
    document.getElementById(`${teamType}team-logo`).src = team.flags.png;

  } catch (error) {
    console.error(`Error al obtener los datos del equipo ${teamType}:`, error);
  }
}

async function obtenerDatosLiga(leagueId) {
  const leagueApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/leagues/${leagueId}`;
  try {
    const leagueData = await fetchAPI(leagueApiUrl);
    const league = leagueData.league;

    document.getElementById('match-tournament').innerText = league.name.es || league.name.en;
    document.getElementById('tournament-logo').src = league.logo;

  } catch (error) {
    console.error('Error al obtener los datos de la liga:', error);
  }
}

obtenerDatosPartido();
