const standingsApiUrl = 'https://wc-qualifications-api-production.up.railway.app/api/v1/standings/4';
const leagueApiUrl = 'https://wc-qualifications-api-production.up.railway.app/api/v1/leagues/4';

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

async function obtenerDatosPaises(countryId) {
    const countryApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/countries/${countryId}`;
    try {
        const countryData = await fetchAPI(countryApiUrl);
        return countryData.country;
    } catch (error) {
        console.error(`Error al obtener los datos del país ${countryId}:`, error);
        return null;
    }
}

async function cargarConfederacion() {
    try {
        const leagueData = await fetchAPI(leagueApiUrl);
        const league = leagueData.league;

        const confederationNameElement = document.getElementById('confederation-name');
        const confederationLogoElement = document.getElementById('confederation-logo');

        confederationNameElement.innerText = league.name.es || league.name.en;
        confederationLogoElement.src = league.logo;

    } catch (error) {
        console.error('Error al obtener los datos de la liga:', error);
    }
}

async function cargarTablaDePosiciones() {
    try {
        const standingsData = await fetchAPI(standingsApiUrl);
        let standings = standingsData.standings;

        // Ordenar las posiciones por puntos de mayor a menor
        standings.sort((a, b) => b.points - a.points);

        const tbody = document.querySelector('#standings-table tbody');
        tbody.innerHTML = '';  // Limpiar la tabla antes de añadir nuevos datos

        for (let i = 0; i < standings.length; i++) {
            const standing = standings[i];
            const country = await obtenerDatosPaises(standing.country_id);

            if (country) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${country.flags.png}" alt="${country.name.es.common}" /></td>
                    <td>${country.name.es.common}</td>
                    <td>${standing.matches_played}</td>
                    <td>${standing.wins}</td>
                    <td>${standing.loss}</td>
                    <td>${standing.draws}</td>
                    <td>${standing.goals_scored}</td>
                    <td>${standing.goals_against}</td>
                    <td>${standing.goal_difference}</td>
                    <td>${standing.points}</td>
                `;

                // Aplicar clases CSS según la posición
                if (i < 6) {
                    row.classList.add('top-positions');
                } else if (i === 6) {
                    row.classList.add('seventh-position');
                }

                tbody.appendChild(row);
            }
        }
    } catch (error) {
        console.error('Error al cargar la tabla de posiciones:', error);
    }
}

// Cargar los datos al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    await cargarConfederacion();
    await cargarTablaDePosiciones();
});
