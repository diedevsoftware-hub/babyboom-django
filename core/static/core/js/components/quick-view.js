// static/js/components/quick-view.js (VERSIÓN FINAL Y CORREGIDA)

import { initializeVariantSelector } from '../modules/product-variants.js';

// Definimos el objeto con los IDs únicos que se usarán DENTRO del modal
const modalIds = {
    mainImage: 'main-product-image-modal',
    thumbnailGallery: 'thumbnail-gallery-modal',
    colorSwatches: 'color-swatches-modal',
    price: 'product-price-modal',
    stock: 'product-stock-modal',
    addToCartBtn: 'add-to-cart-btn-modal',
    quantityInput: 'quantity-input-modal'
};

function initQuickView() {
    const quickViewModal = document.getElementById('quick-view-modal');
    const quickViewOverlay = document.getElementById('quick-view-overlay');
    const quickViewContent = document.getElementById('quick-view-content');
    const quickViewCloseBtn = document.getElementById('quick-view-close-btn');

    function openQuickView() {
        if (quickViewModal && quickViewOverlay) {
            quickViewModal.classList.add('is-open');
            quickViewOverlay.classList.add('is-open');
        }
    }
    
    function closeQuickView() {
        if (quickViewModal && quickViewOverlay) {
            quickViewModal.classList.remove('is-open');
            quickViewOverlay.classList.remove('is-open');
            quickViewContent.innerHTML = '<p class="loading-text">Cargando...</p>';
        }
    }

    document.addEventListener('click', function(event) {
        const quickViewBtn = event.target.closest('.quick-view-btn');
        if (quickViewBtn) {
            event.preventDefault();
            event.stopPropagation();
            
            const productId = quickViewBtn.dataset.productId;
            const url = `/quick-view/${productId}/`;

            quickViewContent.innerHTML = '<p class="loading-text">Cargando...</p>';
            openQuickView();

            fetch(url)
                .then(response => {
                    if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);
                    return response.text();
                })
                .then(html => {
                    quickViewContent.innerHTML = html;

                    // --- CORRECCIÓN FINAL: Llamamos a la función con los 3 parámetros ---
                    // Obtenemos el script con los datos de variantes
const script = document.getElementById('variants-data-modal');
let variants = [];
if (script) {
    try {
        variants = JSON.parse(script.textContent);
    } catch (e) {
        console.error('Error al parsear las variantes:', e);
    }
}
if (Array.isArray(variants)) {
    initializeVariantSelector('#quick-view-modal', modalIds, 'variants-data-modal');
} else {
    console.error('Las variantes para quick view no son un array:', variants);
}
                })
                .catch(error => {
                    console.error("Error al cargar la vista rápida:", error);
                    quickViewContent.innerHTML = '<p>Hubo un error al cargar el producto. Inténtalo de nuevo.</p>';
                });
        }
    });

    if (quickViewCloseBtn && quickViewOverlay) {
        quickViewCloseBtn.addEventListener('click', closeQuickView);
        quickViewOverlay.addEventListener('click', closeQuickView);
    }
}

export { initQuickView };