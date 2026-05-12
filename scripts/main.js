// Variables para controlar el tamaño de las células y la cuadrícula
let cellSize = 25; // Aumentado de 18 a 25 para menos células
let columnCount, rowCount;
let currentCells = [];
let nextCells = [];

// Color fijo (sin cambio cíclico)
let cellColor = '#3c0035'; // Verde fijo

function setup() {
    // Crear canvas que cubra todo el header
    const header = document.getElementById('game-of-life-header');
    const canvas = createCanvas(header.offsetWidth, header.offsetHeight);
    canvas.parent('game-of-life-header');
    
    // Velocidad de la simulación ligeramente más lenta
    frameRate(10);
    
    // Calcular columnas y filas (menos células debido al tamaño mayor)
    columnCount = floor(width / cellSize);
    rowCount = floor(height / cellSize);
    
    // Inicializar las matrices de células
    for (let column = 0; column < columnCount; column++) {
        currentCells[column] = [];
        nextCells[column] = [];
    }
    
    // Iniciar con células aleatorias
    initRandomCells();
    
    // REMOVIDO: No hay reinicio con clic
    // canvas.mousePressed(initRandomCells);
}

function draw() {
    background(250, 250, 250);
    
    // Calcular la siguiente generación
    calculateNextGeneration();
    
    // Dibujar la generación actual
    drawCurrentGeneration();
    
    // Avanzar a la siguiente generación
    for (let column = 0; column < columnCount; column++) {
        for (let row = 0; row < rowCount; row++) {
            currentCells[column][row] = nextCells[column][row];
        }
    }
}

function windowResized() {
    // Redimensionar canvas si la ventana cambia de tamaño
    const header = document.getElementById('game-of-life-header');
    resizeCanvas(header.offsetWidth, header.offsetHeight);
    
    // Recalcular columnas y filas
    columnCount = floor(width / cellSize);
    rowCount = floor(height / cellSize);
    
    // Reinicializar matrices
    currentCells = [];
    nextCells = [];
    for (let column = 0; column < columnCount; column++) {
        currentCells[column] = [];
        nextCells[column] = [];
    }
    
    initRandomCells();
}

// Inicializar con un patrón aleatorio de células
function initRandomCells() {
    // Probabilidad más baja para menos células iniciales
    for (let column = 0; column < columnCount; column++) {
        for (let row = 0; row < rowCount; row++) {
            // 10% de probabilidad de que una célula esté viva inicialmente (reducido de 15%)
            currentCells[column][row] = random(1) > 0.90 ? 1 : 0;
        }
    }
}

// Calcular la siguiente generación según las reglas del Juego de la Vida
function calculateNextGeneration() {
    for (let column = 0; column < columnCount; column++) {
        for (let row = 0; row < rowCount; row++) {
            // Contar vecinos vivos
            let neighbors = 0;
            
            // Verificar las 8 células vecinas
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    
                    let neighborColumn = (column + dx + columnCount) % columnCount;
                    let neighborRow = (row + dy + rowCount) % rowCount;
                    
                    neighbors += currentCells[neighborColumn][neighborRow];
                }
            }
            
            // Aplicar las reglas del Juego de la Vida
            if (currentCells[column][row] === 1) {
                // Célula viva
                if (neighbors < 2 || neighbors > 3) {
                    nextCells[column][row] = 0; // Muere por soledad o sobrepoblación
                } else {
                    nextCells[column][row] = 1; // Sobrevive
                }
            } else {
                // Célula muerta
                if (neighbors === 3) {
                    nextCells[column][row] = 1; // Nace por reproducción
                } else {
                    nextCells[column][row] = 0; // Permanece muerta
                }
            }
        }
    }
}

// Dibujar la generación actual de células
function drawCurrentGeneration() {
    fill(cellColor); // Color fijo
    noStroke();
    
    for (let column = 0; column < columnCount; column++) {
        for (let row = 0; row < rowCount; row++) {
            if (currentCells[column][row] === 1) {
                // Dibujar célula viva con bordes redondeados
                let x = column * cellSize;
                let y = row * cellSize;
                rect(x, y, cellSize - 1, cellSize - 1, 3); // Bordes ligeramente redondeados
            }
        }
    }
}

// Script para el navbar responsive
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animar las líneas del toggle
            const spans = this.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
        
        // Cerrar menú al hacer clic en un enlace
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    
    let currentIndex = 0;
    const totalItems = items.length;
    
    function updateCarousel(index) {
        // Actualizar items
        items.forEach(item => item.classList.remove('active'));
        items[index].classList.add('active');
        
        // Actualizar dots
        dots.forEach(dot => dot.classList.remove('active'));
        dots[index].classList.add('active');
        
        currentIndex = index;
    }
    
    function nextSlide() {
        let newIndex = currentIndex + 1;
        if (newIndex >= totalItems) newIndex = 0;
        updateCarousel(newIndex);
    }
    
    function prevSlide() {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = totalItems - 1;
        updateCarousel(newIndex);
    }
    
    // Eventos botones
    prevBtn.addEventListener('click', prevSlide);
    nextBtn.addEventListener('click', nextSlide);
    
    // Eventos dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => updateCarousel(index));
    });
    
    // Auto reproducción (opcional)
    let autoPlay = setInterval(nextSlide, 5000);
    
    // Pausar auto reproducción al pasar el mouse
    const carousel = document.querySelector('.carousel');
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
    carousel.addEventListener('mouseleave', () => {
        autoPlay = setInterval(nextSlide, 5000);
    });
    
    // Soporte para swipe en móvil
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) nextSlide();
        if (touchEndX > touchStartX + 50) prevSlide();
    });
});