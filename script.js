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

const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', event => {
        const parent = toggle.closest('.dropdown');
        if (!parent) return;

        event.stopPropagation();
        const isOpen = parent.classList.contains('open');
        document.querySelectorAll('.dropdown.open').forEach(drop => {
            if (drop !== parent) drop.classList.remove('open');
        });
        parent.classList.toggle('open', !isOpen);
    });
});

window.addEventListener('click', () => {
    document.querySelectorAll('.dropdown.open').forEach(drop => drop.classList.remove('open'));
});

const filterToggles = document.querySelectorAll('.filter-toggle');
filterToggles.forEach(toggle => {
    const panelContent = toggle.nextElementSibling;
    if (!panelContent) return;

    toggle.addEventListener('click', () => {
        const collapsed = panelContent.classList.toggle('collapsed');
        toggle.setAttribute('aria-expanded', String(!collapsed));
        toggle.classList.toggle('open', !collapsed);
    });
});

// --- Lógica de Produtos da Empresa Silva ---
const pageType = document.body.dataset.page || '';
const listaProdutos = document.getElementById('lista-produtos');
const botoesFiltro = document.querySelectorAll('.filter-btn');
const productsFilterButtons = document.getElementById('products-filter-buttons');
const searchInput = document.getElementById('search-produto');
const searchCount = document.getElementById('search-count');
const selectAllFiltersButton = document.getElementById('select-all-filters');
const clearFiltersButton = document.getElementById('clear-filters');
const MAX_PRODUCTS_ON_HOME = 6;
let todosProdutos = [];
let currentProductCategories = new Set();
let currentProductSearch = '';

async function carregarProdutos() {
    try {
        const response = await fetch('img/Produtos/produtos.json');
        if (!response.ok) return;
        todosProdutos = await response.json();

        if (pageType === 'products') {
            renderProductFilters(todosProdutos);
            setupProductFilterActions();
            configurarBusca();
            aplicarFiltrosProdutos();
        } else {
            exibirProdutos(todosProdutos, MAX_PRODUCTS_ON_HOME);
        }

        botoesFiltro.forEach(btn => {
            btn.addEventListener('click', () => {
                botoesFiltro.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const categoria = btn.getAttribute('data-filter');
                const filtrados = categoria === 'todos'
                    ? todosProdutos
                    : todosProdutos.filter(p => p.categoria === categoria);

                const limit = pageType === 'products' ? 0 : MAX_PRODUCTS_ON_HOME;
                exibirProdutos(filtrados, limit);
            });
        });
    } catch (error) {
        console.error("Erro ao carregar os produtos:", error);
    }
}

function getProductCategories(produtos) {
    return [...new Set(produtos.map(prod => prod.categoria))];
}

function renderProductFilters(produtos) {
    if (!productsFilterButtons) return;
    productsFilterButtons.innerHTML = '';

    const categories = getProductCategories(produtos);
    currentProductCategories = new Set(categories);

    categories.forEach(category => {
        const label = document.createElement('label');
        label.className = 'filter-checkbox';

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = category;
        input.checked = true;
        input.addEventListener('change', () => {
            if (input.checked) {
                currentProductCategories.add(category);
            } else {
                currentProductCategories.delete(category);
            }
            aplicarFiltrosProdutos();
        });

        const span = document.createElement('span');
        span.textContent = category;

        label.appendChild(input);
        label.appendChild(span);
        productsFilterButtons.appendChild(label);
    });
}

function setupProductFilterActions() {
    selectAllFiltersButton?.addEventListener('click', () => {
        const categories = getProductCategories(todosProdutos);
        currentProductCategories = new Set(categories);
        productsFilterButtons.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.checked = true;
        });
        aplicarFiltrosProdutos();
    });

    clearFiltersButton?.addEventListener('click', () => {
        currentProductCategories.clear();
        productsFilterButtons.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.checked = false;
        });
        aplicarFiltrosProdutos();
    });
}

function aplicarFiltrosProdutos() {
    let filtrados = todosProdutos;

    const totalCategorias = getProductCategories(todosProdutos).length;
    if (currentProductCategories.size === 0) {
        filtrados = [];
    } else if (currentProductCategories.size < totalCategorias) {
        filtrados = filtrados.filter(prod => currentProductCategories.has(prod.categoria));
    }

    if (currentProductSearch.trim()) {
        const termo = currentProductSearch.toLowerCase();
        filtrados = filtrados.filter(prod => {
            return [prod.nome, prod.titulo, prod.modelo, prod.categoria, prod.descricao]
                .some(field => typeof field === 'string' && field.toLowerCase().includes(termo));
        });
    }

    exibirProdutos(filtrados);
}

function criarCardProduto(prod) {
    const titulo = prod.titulo || prod.nome || 'Produto';
    const modelo = prod.modelo || 'Modelo não informado';
    const marca = prod.marca || 'Marca não informada';
    const descricao = prod.descricao || 'Descrição não disponível.';
    const codigo = prod.codigo || '0000';

    const mensagemZap = encodeURIComponent(`Olá, tenho interesse na ferramenta ${titulo} código: [${codigo}].`);
    const linkWhatsApp = `https://wa.me/553431990594?text=${mensagemZap}`;

    const card = document.createElement('div');
    card.className = 'produto-card';
    card.tabIndex = 0;
    card.innerHTML = `
        <div class="produto-card-header">
            <img src="${prod.img}" alt="${titulo}">
            <h3>${titulo}</h3>
            <p class="produto-brand">Marca: ${marca}</p>
            <p class="produto-modelo">Modelo: ${modelo}</p>
            <a href="${linkWhatsApp}" target="_blank" class="btn-interesse btn-whatsapp">Pedir via WhatsApp</a>
        </div>
        <div class="produto-card-details">
            <p class="produto-descricao">${descricao}</p>
            <p class="produto-codigo">Código: ${codigo}</p>
        </div>`;

    card.addEventListener('click', event => {
        if (event.target.closest('a')) return;
        card.classList.toggle('active');
    });

    card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            card.classList.toggle('active');
        }
    });

    return card;
}

function exibirProdutos(itens, limit = 0) {
    if (!listaProdutos) return;
    listaProdutos.innerHTML = '';

    let itensParaExibir = itens;
    if (limit > 0) {
        itensParaExibir = itens.slice(0, limit);
    }

    if (itensParaExibir.length === 0) {
        listaProdutos.innerHTML = '<p class="nenhum-produto">Nenhum produto encontrado.</p>';
        if (searchCount) searchCount.textContent = '0 produtos encontrados';
        return;
    }

    itensParaExibir.forEach(prod => {
        listaProdutos.appendChild(criarCardProduto(prod));
    });

    if (searchCount) {
        searchCount.textContent = `${itens.length} produto(s) encontrados`;
    }
}

function configurarBusca() {
    if (!searchInput) return;

    searchInput.addEventListener('input', event => {
        currentProductSearch = event.target.value || '';
        aplicarFiltrosProdutos();
    });
}

if (listaProdutos) {
    carregarProdutos();
}

const blogGrid = document.getElementById('blog-grid');
const blogPosts = document.getElementById('blog-posts');
const blogSearchInput = document.getElementById('search-dicas');
const blogSearchCount = document.getElementById('search-count-dicas');
const blogFilterButtons = document.getElementById('blog-filter-buttons');
let todosPostsBlog = [];
let currentBlogTag = 'Todos';
let currentBlogQuery = '';

const blogFallbackPosts = [
    {
        id: 1,
        tag: 'Manutenção',
        date: '15 de março de 2026',
        title: 'Como identificar quando sua furadeira precisa de manutenção',
        excerpt: 'Saiba os sinais de desgaste e quando levar sua furadeira para assistência técnica.',
        content: [
            'Uma furadeira em bom estado deve funcionar com suavidade. Se ela começa a fazer barulho metálico, perder potência ou vibrar demais, esses são sinais claros de que a manutenção é necessária.',
            'Observe o cabo e o plugue antes do uso, escute ruídos novos e sinta se o equipamento esquenta além do normal. No caso de ruído de escovas ou cheiro de queimado, procure assistência imediatamente.',
            'Na Empresa Silva, fazemos a revisão completa dos componentes elétricos, substituímos escovas, lubrificamos rolamentos e testamos a ferramenta antes de devolver. Assim você mantém a furadeira segura e confiável por mais tempo.'
        ]
    },
    {
        id: 2,
        tag: 'Armazenamento',
        date: '10 de março de 2026',
        title: 'Melhores práticas para armazenar ferramentas elétricas em dias de chuva',
        excerpt: 'Entenda como proteger seus equipamentos da umidade e prolongar sua vida útil.',
        content: [
            'Umidade e água são inimigas das ferramentas elétricas. Depois de usar, limpe o equipamento e deixe-o secar em local ventilado. Evite guardá-lo em áreas molhadas ou dentro de sacos plásticos fechados.',
            'Use caixas plásticas resistentes ou malas especiais com forro seco. Coloque sílica gel ou outros absorventes de umidade dentro do estojo, para reduzir o risco de curto-circuito e corrosão.',
            'Ao transportar, prefira capas que deixem o equipamento arejado. A Empresa Silva também orienta sobre o melhor acondicionamento das baterias e do carregador, pois esses itens também sofrem com a umidade.'
        ]
    },
    {
        id: 3,
        tag: 'Peças',
        date: '05 de março de 2026',
        title: 'Por que a troca de peças originais faz diferença no reparo',
        excerpt: 'Descubra por que usar componentes originais é melhor para desempenho e segurança.',
        content: [
            'Peças originais garantem que o equipamento continue operando dentro das especificações do fabricante. Elas têm encaixe perfeito, durabilidade maior e mantêm a segurança do produto.',
            'Peças paralelas podem até funcionar no curto prazo, mas desgastam mais rápido e podem anular a garantia. Isso aumenta o risco de novas falhas e custos adicionais.',
            'Na assistência técnica, priorizamos componentes originais de marcas autorizadas. Assim evitamos falhas causadas por materiais de baixa qualidade e asseguramos que a ferramenta continue segura para uso profissional ou doméstico.'
        ]
    },
    {
        id: 4,
        tag: 'Segurança',
        date: '28 de fevereiro de 2026',
        title: 'Checklist rápido antes de usar sua lixadeira ou serra',
        excerpt: 'Veja os itens essenciais para conferir antes de ligar sua máquina.',
        content: [
            'Antes de ligar a lixadeira ou a serra, faça uma checagem simples: cabo e plugue intactos, disco ou lixa bem fixados, interruptor funcionando e proteção adequada instalada.',
            'Use sempre óculos de segurança, protetor auricular e luvas. Se o equipamento estiver travando, fumegando ou vibrando fora do normal, pare imediatamente e procure assistência técnica.',
            'Mantenha o local de trabalho limpo e seco. Poeira acumulada prejudica o desempenho da máquina e interfere na circulação de ar. A manutenção preventiva e o cuidado no uso fazem toda a diferença.'
        ]
    }
];

function getBlogTags(posts) {
    const tags = new Set(posts.map(post => post.tag));
    return ['Todos', ...tags];
}

function renderBlogFilters(posts) {
    if (!blogFilterButtons) return;

    blogFilterButtons.innerHTML = '';
    const tags = getBlogTags(posts);

    tags.forEach(tag => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = tag;
        button.dataset.tag = tag;
        if (tag === 'Todos') button.classList.add('active');
        button.addEventListener('click', () => {
            currentBlogTag = tag;
            atualizarFiltroAtivo(tag);
            filtrarPostsBlog();
        });
        blogFilterButtons.appendChild(button);
    });
}

function atualizarFiltroAtivo(tag) {
    if (!blogFilterButtons) return;
    blogFilterButtons.querySelectorAll('button').forEach(button => {
        button.classList.toggle('active', button.dataset.tag === tag);
    });
}

function filtrarPostsBlog() {
    let filtrados = todosPostsBlog;

    if (currentBlogTag !== 'Todos') {
        filtrados = filtrados.filter(post => post.tag === currentBlogTag);
    }

    if (currentBlogQuery.trim()) {
        const termo = currentBlogQuery.toLowerCase();
        filtrados = filtrados.filter(post => {
            const texto = `${post.title} ${post.excerpt} ${post.tag} ${post.content.join(' ')}`.toLowerCase();
            return texto.includes(termo);
        });
    }

    renderBlogGrid(filtrados);
    renderBlogPosts(filtrados);
    atualizarContagemBlog(filtrados.length);
}

function configurarBuscaDicas() {
    if (!blogSearchInput) return;

    blogSearchInput.addEventListener('input', event => {
        currentBlogQuery = event.target.value || '';
        filtrarPostsBlog();
    });
}

function renderBlogGrid(posts) {
    if (!blogGrid) return;
    blogGrid.innerHTML = '';

    if (posts.length === 0) {
        blogGrid.innerHTML = '<p class="nenhum-produto">Nenhum post encontrado.</p>';
        return;
    }

    posts.forEach(post => {
        const card = document.createElement('article');
        card.className = 'blog-card';
        card.innerHTML = `
            <div class="blog-card-content">
                <span class="blog-tag">${post.tag}</span>
                <h2>${post.title}</h2>
                <p>${post.excerpt}</p>
                <div class="blog-meta">
                    <span>${post.date}</span>
                    <a href="#post-${post.id}" class="read-more-btn">Leia mais</a>
                </div>
            </div>`;
        blogGrid.appendChild(card);
    });
}

function renderBlogPosts(posts) {
    if (!blogPosts) return;
    blogPosts.innerHTML = '';

    if (posts.length === 0) {
        blogPosts.innerHTML = '<p class="nenhum-produto">Nenhum post encontrado.</p>';
        return;
    }

    posts.forEach(post => {
        const detail = document.createElement('article');
        detail.className = 'blog-detail';
        detail.id = `post-${post.id}`;
        detail.innerHTML = `
            <h2>${post.title}</h2>
            ${post.content.map(text => `<p>${text}</p>`).join('')}
            <a href="#top" class="back-to-top">Voltar ao topo</a>`;
        blogPosts.appendChild(detail);
    });
}

function atualizarContagemBlog(total) {
    if (!blogSearchCount) return;
    blogSearchCount.textContent = `${total} post(s) encontrados`;
}

async function carregarBlog() {
    if (!blogGrid && !blogPosts) return;

    let posts = blogFallbackPosts;
    try {
        const response = await fetch('blog-posts.json');
        if (response.ok) {
            posts = await response.json();
        } else {
            console.warn('blog-posts.json não pôde ser carregado, usando dados locais.');
        }
    } catch (error) {
        console.warn('Falha ao carregar blog-posts.json, usando dados locais.', error);
    }

    todosPostsBlog = posts;
    currentBlogTag = 'Todos';
    currentBlogQuery = '';
    renderBlogFilters(posts);
    configurarBuscaDicas();

    filtrarPostsBlog();
}

carregarBlog();