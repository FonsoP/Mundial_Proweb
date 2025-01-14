const newsApiUrl = 'https://wc-qualifications-api-production.up.railway.app/api/v1/news';
let currentNewsPage = 0;
const newsPerPage = 5;

async function fetchNews() {
  try {
    const response = await fetch(newsApiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const newsData = await response.json();
    const newsContainer = document.getElementById('news-container');

    const startIndex = currentNewsPage * newsPerPage;
    const endIndex = startIndex + newsPerPage;
    const newsToDisplay = newsData.news.slice(startIndex, endIndex);

    newsToDisplay.forEach((article, index) => {
      const newsBox = document.createElement('div');
      newsBox.classList.add('box', 'col-md');

      if (index === 0) {
        newsBox.classList.add('col-md-8'); // Primera noticia ocupa más espacio
      } else {
        newsBox.classList.add('col-md-4'); // Las otras noticias ocupan menos espacio
      }

      const boxImg = document.createElement('div');
      boxImg.classList.add('box-img');
      const img = document.createElement('img');
      img.src = article.image;
      img.alt = 'image';
      boxImg.appendChild(img);
      
      const titleNotice = document.createElement('div');
      titleNotice.classList.add('tittle-notice');
      const title = document.createElement('h3');
      title.innerText = article.title.en; // Puedes ajustar esto según el idioma
      titleNotice.appendChild(title);

      const previewText = document.createElement('span');
      previewText.innerText = article.preview_text.en; // Puedes ajustar esto según el idioma

      const infoIcon = document.createElement('i');
      infoIcon.classList.add('fa-solid', 'fa-eye');
      infoIcon.onclick = () => window.open(article.url.en, '_blank');

      newsBox.appendChild(boxImg);
      newsBox.appendChild(titleNotice);
      newsBox.appendChild(previewText);
      newsBox.appendChild(infoIcon);
      
      newsContainer.appendChild(newsBox);
    });

    currentNewsPage++;
    if (currentNewsPage * newsPerPage >= newsData.news.length) {
      document.getElementById('load-more').style.display = 'none';
    }
  } catch (error) {
    console.error('Error al obtener las noticias:', error);
  }
}

document.getElementById('load-more').addEventListener('click', fetchNews);

fetchNews();

/* Para la navbar */
let menu = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menu.onclick = () => { navbar.classList.toggle('active'); }
window.onscroll = () => { navbar.classList.remove('active'); }

/* Código adicional para el carrusel de confederaciones */
document.addEventListener("DOMContentLoaded", () => {
  const confederationsApiUrl = 'https://wc-qualifications-api-production.up.railway.app/api/v1/leagues';

  async function fetchConfederations() {
    try {
      const response = await fetch(confederationsApiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const confederationsData = await response.json();
      const confederationsContainer = document.getElementById('confederations-container');

      confederationsData.leagues.forEach(confederation => {
        const cardItem = document.createElement('li');
        cardItem.classList.add('card-item', 'swiper-slide');

        const cardLink = document.createElement('a');
        cardLink.classList.add('card-link');
        console.log(confederation.website);
        cardLink.href = confederation.website;
        cardLink.target = "_blank";

        const cardImage = document.createElement('img');
        cardImage.classList.add('card-image');
        cardImage.src = confederation.logo;
        cardImage.alt = confederation.name.en;

        const badge = document.createElement('p');
        badge.classList.add('badge');
        badge.innerText = confederation.name.en;

        const cardTitle = document.createElement('h2');
        cardTitle.classList.add('card-title');
        cardTitle.innerText = shortenText(confederation.qualification_process.en.join(' '), 100);

        const cardButton = document.createElement('button');
        cardButton.classList.add('card-button');
        const buttonIcon = document.createElement('i');
        buttonIcon.classList.add('fa-solid', 'fa-arrow-right');
        cardButton.appendChild(buttonIcon);

        cardLink.appendChild(cardImage);
        cardLink.appendChild(badge);
        cardLink.appendChild(cardTitle);
        cardLink.appendChild(cardButton);
        cardItem.appendChild(cardLink);
        confederationsContainer.appendChild(cardItem);
      });

      // Inicializar Swiper
      new Swiper('.card-wrapper', {
        loop: true,
        speed: 700,
        spaceBetween: 30,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
          dynamicBullets: true,
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        breakpoints: {
          0: {
            slidesPerView: 1
          },
          768: {
            slidesPerView: 2
          },
          1024: {
            slidesPerView: 3
          },
        }
      });
    } catch (error) {
      console.error('Error al obtener las confederaciones:', error);
    }
  }

  function shortenText(text, maxLength) {
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  }

  fetchConfederations();
});
