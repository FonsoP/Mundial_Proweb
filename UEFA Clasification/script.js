const leagueId = 6;
const standingsApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/standings/${leagueId}`;
const leagueApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/leagues/${leagueId}`;

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

// Cargar los datos al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    await cargarConfederacion();
    await cargarTablaDePosiciones();
});
