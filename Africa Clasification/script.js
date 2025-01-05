const leagueId = 2;
const leagueApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/leagues/${leagueId}`;
const standingsApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/standings/${leagueId}`;

async function fetchAPI(url) {
    try {
        console.log(`Fetching from URL: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Data fetched from ${url}:`, data);
        return data;
    } catch (error) {
        console.error(`Failed to fetch from ${url}:`, error);
        throw error;
    }
}

function mostrarSpinner() {
    document.getElementById('spinner-container').style.display = 'flex';
}

function ocultarSpinner() {
    document.getElementById('spinner-container').style.display = 'none';
}

async function obtenerDatosPaises(countryId) {
    const countryApiUrl = `https://wc-qualifications-api-production.up.railway.app/api/v1/countries/${countryId}`;
    try {
        const countryData = await fetchAPI(countryApiUrl);
        console.log(`Datos del país ${countryId} obtenidos:`, countryData);
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

        console.log(`Datos de la confederación obtenidos:`, league);
    } catch (error) {
        console.error('Error al obtener los datos de la liga:', error);
    }
}

async function cargarGrupos() {
    try {
        mostrarSpinner();
        const standingsData = await fetchAPI(standingsApiUrl);
        let standings = standingsData.standings;

        console.log(`Datos de la confederación africana obtenidos:`, standings);

        // Obtener los grupos únicos y ordenar alfabéticamente
        const grupos = [...new Set(standings.map(standing => standing.group))].sort();

        console.log(`Grupos obtenidos:`, grupos);

        const groupSelect = document.getElementById('group-select');
        groupSelect.innerHTML = '<option value="all">Todos los Grupos</option>'; // Limpiar y añadir opción para todos los grupos

        grupos.forEach(grupo => {
            const option = document.createElement('option');
            option.value = grupo;
            option.innerText = `Grupo ${grupo}`;
            groupSelect.appendChild(option);
        });

        // Cargar la tabla del primer grupo por defecto
        if (grupos.length > 0) {
            await cargarTablasDeGrupos("all");
        }

    } catch (error) {
        console.error('Error al cargar los grupos:', error);
    } finally {
        ocultarSpinner();
    }
}

async function cargarTablasDeGrupos(group) {
    try {
        mostrarSpinner();
        const standingsData = await fetchAPI(standingsApiUrl);
        let standings = standingsData.standings;

        console.log(`Datos filtrados por grupo ${group}:`, standings);

        const tablesContainer = document.getElementById('tables-container');
        tablesContainer.innerHTML = '';  // Limpiar el contenedor de tablas

        if (group === "all") {
            const grupos = [...new Set(standings.map(standing => standing.group))].sort();
            for (const grupo of grupos) {
                const groupStandings = standings.filter(standing => standing.group === grupo);
                const table = await crearTablaDePosiciones(groupStandings, grupo);
                tablesContainer.appendChild(table);
            }
        } else {
            const groupStandings = standings.filter(standing => standing.group === group);
            const table = await crearTablaDePosiciones(groupStandings, group);
            tablesContainer.appendChild(table);
        }

    } catch (error) {
        console.error('Error al cargar las tablas de grupos:', error);
    } finally {
        ocultarSpinner();
    }
}

async function crearTablaDePosiciones(groupStandings, group) {
    // Ordenar las posiciones por puntos de mayor a menor
    groupStandings.sort((a, b) => b.points - a.points);

    const table = document.createElement('table');
    table.classList.add('table', 'mb-4');
    const thead = document.createElement('thead');
    thead.classList.add('thead-dark');
    thead.innerHTML = `
        <tr>
            <th colspan="10">Grupo ${group}</th>
        </tr>
        <tr>
            <th scope="col">Escudo</th>
            <th scope="col">Nombre</th>
            <th scope="col">PJ</th>
            <th scope="col">PG</th>
            <th scope="col">PP</th>
            <th scope="col">PE</th>
            <th scope="col">GF</th>
            <th scope="col">GA</th>
            <th scope="col">GD</th>
            <th scope="col">PTS</th>
        </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    for (let i = 0; i < groupStandings.length; i++) {
        const standing = groupStandings[i];
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
            if (i == 0) {
                row.classList.add('first-position'); 
            } else if (i == 1) {
                row.classList.add('top-positions'); 
            }

            tbody.appendChild(row);
            console.log(`Fila añadida para ${country.name.es.common}`);
        }
    }

    table.appendChild(tbody);
    
    // Crear un contenedor responsivo para la tabla de cada grupo
    const tableWrapper = document.createElement('div');
    tableWrapper.classList.add('table-responsive');
    tableWrapper.appendChild(table);  // Añadir la tabla al contenedor

    return tableWrapper;  // Devolver el contenedor con la tabla
}

// Cargar los datos al cambiar el grupo
document.getElementById('group-select').addEventListener('change', (event) => {
    const selectedGroup = event.target.value;
    console.log(`Grupo seleccionado: ${selectedGroup}`);
    cargarTablasDeGrupos(selectedGroup);
});

// Cargar los datos al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    await cargarConfederacion();
    await cargarGrupos();  // Cargar los grupos de la confederación africana
});
