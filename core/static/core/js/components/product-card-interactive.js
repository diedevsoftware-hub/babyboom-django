// static/js/components/product-card-interactive.js (VERSIÓN DE DEPURACIÓN)
import { openMiniCart } from './minicart.js';

function initInteractiveCards() {
    const allVariantsDataElem = document.getElementById('all-variants-data');
    if (!allVariantsDataElem) {
        return; 
    }

    const allVariantsData = JSON.parse(allVariantsDataElem.textContent);
    const productGrid = document.querySelector('.product-grid');
    console.log("Debug: Datos de variantes cargados:", allVariantsData);

    function updateCardPrice(card, variant) {
        const priceContainer = card.querySelector('.product-card-price');
        if (!priceContainer) return;
        let priceHTML = `<span class="price">S/ ${variant.price}</span>`;
        if (variant.sale_price) {
            priceHTML = `<span class="sale-price">S/ ${variant.sale_price}</span> <span class="original-price">S/ ${variant.price}</span>`;
        }
        priceContainer.innerHTML = priceHTML;
    }
    
    function toggleCarouselArrows(card, variant) {
        const arrows = card.querySelectorAll('.card-carousel-arrow');
        if (arrows) {
            console.log(`Debug (Producto ID ${card.dataset.productId}): Variante tiene ${variant.image_count} imágenes.`);
            arrows.forEach(arrow => {
                arrow.style.display = variant.image_count > 1 ? 'flex' : 'none';
            });
        }
    }

    document.querySelectorAll('.product-card').forEach(card => {
        const productId = card.dataset.productId;
        if (!productId) return;
        
        const variants = allVariantsData[productId];
        if (!variants || variants.length === 0) return;

        card.dataset.variants = JSON.stringify(variants);
        card.dataset.currentVariantIndex = "0";
        card.dataset.currentImageIndex = "0";

        const swatchesContainer = card.querySelector('.card-swatches');
        if (swatchesContainer) {
            swatchesContainer.innerHTML = '';
            variants.forEach((variant, index) => {
                if (variant.color_hex) {
                    const swatch = document.createElement('button');
                    swatch.className = 'card-swatch';
                    swatch.style.backgroundColor = variant.color_hex;
                    swatch.dataset.variantIndex = index;
                    if (index === 0) swatch.classList.add('active');
                    swatchesContainer.appendChild(swatch);
                }
            });
        }
        
        updateCardPrice(card, variants[0]);
        toggleCarouselArrows(card, variants[0]);
    });
    
    if (productGrid) {
        productGrid.addEventListener('click', function(event) {
            const card = event.target.closest('.product-card');
            if (!card) return;

            const variants = JSON.parse(card.dataset.variants || '[]');
            if (variants.length === 0) return;

            let currentVariantIndex = parseInt(card.dataset.currentVariantIndex);
            let currentImageIndex = parseInt(card.dataset.currentImageIndex);

            if (event.target.closest('.card-swatch')) {
                const swatch = event.target.closest('.card-swatch');
                const newVariantIndex = parseInt(swatch.dataset.variantIndex);
                if (newVariantIndex === currentVariantIndex) return;

                card.dataset.currentVariantIndex = newVariantIndex;
                card.dataset.currentImageIndex = "0";
                
                const newVariant = variants[newVariantIndex];
                card.querySelector('.product-card-image').src = newVariant.images[0] || '';
                updateCardPrice(card, newVariant);
                toggleCarouselArrows(card, newVariant);

                card.querySelectorAll('.card-swatch').forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
            }

            if (event.target.closest('.card-carousel-arrow')) {
                const arrow = event.target.closest('.card-carousel-arrow');
                const direction = parseInt(arrow.dataset.direction);
                const currentVariant = variants[currentVariantIndex];
                const images = currentVariant.images;
                if (images.length <= 1) return;

                let newImageIndex = currentImageIndex + direction;
                
                if (newImageIndex >= images.length) newImageIndex = 0;
                if (newImageIndex < 0) newImageIndex = images.length - 1;

                card.dataset.currentImageIndex = newImageIndex;
                card.querySelector('.product-card-image').src = images[newImageIndex];
            }

            if (event.target.closest('.add-to-cart-card-btn')) {
                console.log("Debug: Clic en 'Añadir al Carrito'");
                const currentVariant = variants[currentVariantIndex];
                const variantId = currentVariant.id;
                const quantity = 1;
                const csrftokenInput = document.querySelector('[name=csrfmiddlewaretoken]');
                
                if (!csrftokenInput) {
                    console.error('Error Crítico: No se encontró el token CSRF en la página. Asegúrate de que {% csrf_token %} está en el template.');
                    return;
                }
                const csrftoken = csrftokenInput.value;
                console.log("Debug: Enviando al carrito - Variant ID:", variantId, "Token:", csrftoken);

                fetch('/cart/add/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRFToken': csrftoken },
                    body: `variant_id=${variantId}&quantity=${quantity}`
                })
                .then(response => {
                    console.log("Debug: Respuesta del servidor:", response);
                    if (!response.ok) {
                        console.error("Debug: Error en la respuesta del servidor, Status:", response.status);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Debug: Datos recibidos:", data);
                    if (data.status === 'ok') {
                        openMiniCart();
                    }
                })
                .catch(error => console.error('Error en fetch:', error));
            }
        });
    }
}

export { initInteractiveCards };