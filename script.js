let carouselImages = [];
const carouselContainer = document.querySelector('.carousel-container');
const dotContainer = document.querySelector('.dots');
let currentIndex = 0;
let intervalId = null; // Inicializado como null

async function loadImages() {
    try {
        const response = await fetch('img/ImgDeDestaques/images.json');
        if (!response.ok) throw new Error('Falha ao carregar JSON');
        carouselImages = await response.json();

        if (carouselImages.length > 0) {
            setupDots();
            startCarousel();
        }
    } catch (error) {
        console.error('Erro ao carregar imagens:', error);
    }
}

function updateCarousel(index) {
    if (!carouselImages[index]) return;

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
    // Limpa qualquer intervalo ativo antes de começar um novo
    if (intervalId) clearInterval(intervalId);

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
            currentIndex = i;
            updateCarousel(currentIndex);
            startCarousel(); // Reinicia o tempo ao clicar
        });

        dotContainer.appendChild(span);
    });
}

// Verifica se os elementos existem antes de rodar o carrossel
if (carouselContainer && dotContainer) {
    loadImages();
}

// --- Lógica do Menu Mobile ---
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');

// O '?' (Optional Chaining) evita erro se o botão não existir na página
menuToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('active');
    menuToggle.textContent = navMenu?.classList.contains('active') ? '✕' : '☰';
});

document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu?.classList.remove('active');
        if (menuToggle) menuToggle.textContent = '☰';
    });
});

// --- Lógica de Produtos da Empresa Silva ---
const listaProdutos = document.getElementById('lista-produtos');
const botoesFiltro = document.querySelectorAll('.filter-btn');

async function carregarProdutos() {
    try {
        const response = await fetch('img/Produtos/produtos.json');
        if (!response.ok) return;
        const produtos = await response.json();

        // Renderiza todos ao carregar a página
        exibirProdutos(produtos);

        // Configura os cliques nos filtros
        // Suporta novas categorias adicionadas no HTML, como Acessórios
        botoesFiltro.forEach(btn => {
            btn.addEventListener('click', () => {
                botoesFiltro.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const categoria = btn.getAttribute('data-filter');
                const filtrados = categoria === 'todos'
                    ? produtos
                    : produtos.filter(p => p.categoria === categoria);

                exibirProdutos(filtrados);
            });
        });
    } catch (error) {
        console.error("Erro ao carregar os produtos:", error);
    }
}

function exibirProdutos(itens) {
    if (!listaProdutos) return;
    listaProdutos.innerHTML = '';

    itens.forEach(prod => {
        // Formata a mensagem do WhatsApp automaticamente
        const mensagemZap = encodeURIComponent(`Olá! Tenho interesse no produto: ${prod.nome}`);
        const linkWhatsApp = `https://wa.me/553431990594?text=${mensagemZap}`;

        const card = document.createElement('div');
        card.className = 'produto-card';
        card.innerHTML = `
            <img src="${prod.img}" alt="${prod.nome}">
            <h3>${prod.nome}</h3>
            <a href="${linkWhatsApp}" target="_blank" class="btn-interesse">Tenho Interesse</a>
        `;
        listaProdutos.appendChild(card);
    });
}

// Inicializa a função de produtos
if (listaProdutos) {
    carregarProdutos();
}