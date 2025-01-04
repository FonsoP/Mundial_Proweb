const matchApiUrl = 'https://wc-qualifications-api-production.up.railway.app/api/v1/matches/4/270945';

async function fetchAPI(url) {
  try {
    console.log(`Fetching from URL: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(`Successfully fetched data from ${url}`);
    return response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    throw error;
  }
}

async function obtenerDatosPartido() {
  try {
    console.log('Obteniendo datos del partido...');
    const matchData = await fetchAPI(matchApiUrl);
    const match = matchData.match;
    console.log('Datos del partido obtenidos:', match);

    document.getElementById('match-status').innerText = match.status;
    document.getElementById('match-date').innerText = `${match.date} at ${match.time}`;
    document.getElementById('hometeam-score').innerText = match.hometeam_score;
    document.getElementById('awayteam-score').innerText = match.awayteam_score;
    document.getElementById('match-referee').innerText = match.referee;

    console.log('Datos del partido actualizados en el DOM');
    await obtenerDatosEquipo(match.hometeam_id, 'home');
    await obtenerDatosEquipo(match.awayteam_id, 'away');
    await obtenerDatosLiga(match.league_id);

    // Mostrar eventos del partido
    const eventsList = document.getElementById('event-list');
    match.cards.forEach(event => {
      const li = document.createElement('li');
      li.classList.add('event-item');
      li.innerText = `${event.time}' - ${event.card} - ${event.player}`;
      eventsList.appendChild(li);
    });

    // Mostrar estadísticas del partido
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

    // Mostrar alineaciones del equipo local y visitante
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
    console.log(`Obteniendo datos del equipo ${teamType}...`);
    const teamData = await fetchAPI(teamApiUrl);
    const team = teamData.country;
    console.log(`Datos del equipo ${teamType} obtenidos:`, team);

    const teamNameElement = document.getElementById(`${teamType}team-name`);
    const teamLogoElement = document.getElementById(`${teamType}team-logo`);

    if (teamNameElement && teamLogoElement) {
      teamNameElement.innerText = team.name.es.common;
      teamLogoElement.src = team.flags.png;
      console.log(`Datos del equipo ${teamType} actualizados en el DOM`);
    } else {
      console.error(`Elementos del DOM para ${teamType} no encontrados.`);
    }

  } catch (error) {
    console.error(`Error al obtener los datos del equipo ${teamType}:`, error);
  }
}

async function obtenerDatosLiga(leagueId) {
  const leagueApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/leagues/${leagueId}`;
  try {
    console.log('Obteniendo datos de la liga...');
    const leagueData = await fetchAPI(leagueApiUrl);
    const league = leagueData.league;
    console.log('Datos de la liga obtenidos:', league);

    const tournamentElement = document.getElementById('match-tournament');
    const tournamentLogoElement = document.getElementById('tournament-logo');

    if (tournamentElement) {
      tournamentElement.innerText = league.name.es || league.name.en;
      console.log(`Nombre del torneo: ${league.name.es || league.name.en}`);
    } else {
      console.error('Elemento del DOM "match-tournament" no encontrado.');
    }

    if (tournamentLogoElement && league.logo) {
      tournamentLogoElement.src = league.logo;
    } else {
      console.error('Elemento del DOM "tournament-logo" no encontrado o logo no disponible.');
    }

    console.log('Datos de la liga actualizados en el DOM');

  } catch (error) {
    console.error('Error al obtener los datos de la liga:', error);
  }
}

obtenerDatosPartido();
