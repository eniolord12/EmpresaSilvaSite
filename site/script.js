let carouselImages = [];
const carouselContainer = document.querySelector('.carousel-container');
const dotContainer = document.querySelector('.dots');
let currentIndex = 0;
let intervalId;

async function loadImages() {
    try {
        const response = await fetch('img/ImgDeDestaques/images.json');
        carouselImages = await response.json();
        setupDots();
        startCarousel();
    } catch (error) {
        console.error('Erro ao carregar imagens:', error);
    }
}

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
    if (carouselImages.length > 0) {
        updateCarousel(currentIndex);
        intervalId = setInterval(nextImage, 2500);
    }
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
    loadImages();
}
