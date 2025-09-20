// static/js/app.js

import { initHeader } from './components/header.js';
import { initMiniCart } from './components/minicart.js';
import { initQuickView } from './components/quick-view.js';
import { initSearch } from './components/search.js';
import { initBackToTop } from './utils/back-to-top.js';
import { initInteractiveCards } from './components/product-card-interactive.js';
import { initThemeSwitcher } from './components/theme-switcher.js';

document.addEventListener('DOMContentLoaded', function() {
    initThemeSwitcher(); 
    // Inicializa todos los componentes globales
    initHeader();
    initMiniCart();
    initQuickView();
    initSearch();
    initBackToTop();
    initInteractiveCards();
    // --- INICIALIZAR LIBRERÍA DE ANIMACIONES ---
    AOS.init({
        duration: 800, // Duración de la animación en milisegundos
        once: true,    // La animación solo ocurre una vez
    });
});