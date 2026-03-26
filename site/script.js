const carouselImages = [
    { src: 'img/ImgDeDestaques/Bancada-enio.jpg', alt: 'Destaque DEWALT' },
    { src: 'img/ImgDeDestaques/bancada-eniojr.jpg', alt: 'Destaque STANLEY' },
    { src: 'img/ImgDeDestaques/fachada.jpg', alt: 'Destaque BLACK+DECKER' },
];

const carouselContainer = document.querySelector('.carousel-container');
const dotContainer = document.querySelector('.dots');
let currentIndex = 0;
let intervalId;

function updateCarousel(index) {
    const imageData = carouselImages[index];
    let img = carouselContainer.querySelector('img');

    if (!img) {
        img = document.createElement('img');
        carouselContainer.appendChild(img);
    }

    img.src = imageData.src;
    img.alt = imageData.alt;

    const dots = dotContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

function nextImage() {
    currentIndex = (currentIndex + 1) % carouselImages.length;
    updateCarousel(currentIndex);
}

function startCarousel() {
    updateCarousel(currentIndex);
    intervalId = setInterval(nextImage, 2500);
}

function setupDots() {
    dotContainer.innerHTML = '';

    carouselImages.forEach((_, i) => {
        const span = document.createElement('span');
        span.className = 'dot';

        span.addEventListener('click', () => {
            clearInterval(intervalId);
            currentIndex = i;
            updateCarousel(currentIndex);
            startCarousel();
        });

        dotContainer.appendChild(span);
    });
}

if (carouselContainer && dotContainer) {
    setupDots();
    startCarousel();
}
