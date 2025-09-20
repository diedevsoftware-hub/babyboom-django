// static/js/modules/product-variants.js

import { openMiniCart } from '../components/minicart.js';

// --- FUNCIÓN HELPER PARA MOSTRAR MENSAJES ---
function showStockAlert(message) {
    // Evita crear mensajes duplicados
    if (document.querySelector('.stock-alert-message')) return;

    const alertBox = document.createElement('div');
    alertBox.className = 'stock-alert-message';
    alertBox.textContent = message;
    document.body.appendChild(alertBox);

    // Muestra el mensaje
    setTimeout(() => {
        alertBox.classList.add('show');
    }, 10);

    // Oculta y elimina el mensaje después de 3 segundos
    setTimeout(() => {
        alertBox.classList.remove('show');
        setTimeout(() => {
            alertBox.remove();
        }, 300);
    }, 3000);
}

function initializeVariantSelector(containerSelector = 'body', ids, dataScriptId) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const variantsDataElem = document.getElementById(dataScriptId);
    if (!variantsDataElem) {
        console.error(`Error: No se encontró el script #${dataScriptId}.`);
        return;
    }
    const variants = JSON.parse(variantsDataElem.textContent);
    if (!variants || variants.length === 0) return;

    const mainImage = container.querySelector(`#${ids.mainImage}`);
    const thumbnailGallery = container.querySelector(`#${ids.thumbnailGallery}`);
    const colorSwatchesContainer = container.querySelector(`#${ids.colorSwatches}`);
    const priceContainer = container.querySelector(`#${ids.price}`);
    const stockContainer = container.querySelector(`#${ids.stock}`);
    const addToCartBtn = container.querySelector(`#${ids.addToCartBtn}`);
    const quantityInput = container.querySelector(`#${ids.quantityInput}`);

    let currentVariant = variants[0];

    function updateProductDetails(variant) {
        // ... (esta función interna no necesita cambios)
        currentVariant = variant;
        if (priceContainer) {
            let priceHTML = `<span class="price">S/ ${variant.price}</span>`;
            if (variant.sale_price) priceHTML = `<span class="sale-price">S/ ${variant.sale_price}</span> <span class="original-price">S/ ${variant.price}</span>`;
            priceContainer.innerHTML = priceHTML;
        }
        if (stockContainer) {
            if (variant.stock > 10) stockContainer.innerHTML = `<span class="stock-available">Stock disponible: ${variant.stock}</span>`;
            else if (variant.stock > 0) stockContainer.innerHTML = `<span class="stock-low">¡Últimas unidades! Quedan ${variant.stock}</span>`;
            else stockContainer.innerHTML = `<span class="stock-out">Agotado</span>`;
            if (addToCartBtn) {
                addToCartBtn.disabled = variant.stock === 0;
                addToCartBtn.textContent = variant.stock > 0 ? 'Agregar al Carrito' : 'Agotado';
            }
        }
        if (mainImage) mainImage.src = variant.images[0] || '';
        if (thumbnailGallery) {
            thumbnailGallery.innerHTML = '';
            variant.images.forEach((imgUrl, index) => {
                const thumb = document.createElement('img');
                thumb.src = imgUrl; thumb.className = 'thumbnail-image';
                if (index === 0) thumb.classList.add('active');
                thumb.addEventListener('click', () => {
                    mainImage.src = imgUrl;
                    thumbnailGallery.querySelectorAll('.thumbnail-image').forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
                thumbnailGallery.appendChild(thumb);
            });
        }
    }
    
    if (colorSwatchesContainer) {
        colorSwatchesContainer.innerHTML = '';
        variants.forEach(variant => {
            if (variant.color_hex) {
                const swatch = document.createElement('button');
                swatch.className = 'color-swatch'; swatch.style.backgroundColor = variant.color_hex; swatch.title = variant.color_name;
                swatch.addEventListener('click', () => {
                    updateProductDetails(variant);
                    colorSwatchesContainer.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
                    swatch.classList.add('active');
                });
                colorSwatchesContainer.appendChild(swatch);
            }
        });
        const firstSwatch = colorSwatchesContainer.querySelector('.color-swatch');
        if (firstSwatch) firstSwatch.classList.add('active');
    }

    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(quantityInput.value);
            if (quantity > currentVariant.stock) {
                showStockAlert(`Solo quedan ${currentVariant.stock} unidades en stock.`);
                return;
            }
            const csrftoken = container.querySelector('[name=csrfmiddlewaretoken]').value;
            fetch('/cart/add/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'X-CSRFToken': csrftoken }, body: `variant_id=${currentVariant.id}&quantity=${quantity}` })
            .then(res => res.json())
            .then(data => { if (data.status === 'ok') openMiniCart(); })
        });
    }

    // --- LÓGICA DE BOTONES Y VALIDACIÓN DE STOCK ---
    container.addEventListener('click', (event) => {
        const quantityBtn = event.target.closest('.quantity-btn');
        if (quantityBtn && quantityInput) {
            let currentValue = parseInt(quantityInput.value);
            if (quantityBtn.classList.contains('increase')) {
                if (currentValue < currentVariant.stock) {
                    currentValue++;
                } else {
                    showStockAlert(`¡Stock máximo alcanzado! (${currentVariant.stock} unidades)`);
                }
            } else if (quantityBtn.classList.contains('decrease')) {
                currentValue = Math.max(1, currentValue - 1);
            }
            quantityInput.value = currentValue;
        }
    });

    quantityInput.addEventListener('input', () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > currentVariant.stock) {
            showStockAlert(`Solo quedan ${currentVariant.stock} unidades disponibles.`);
            quantityInput.value = currentVariant.stock; // Corregimos al máximo
        }
        if (currentValue < 1) {
            quantityInput.value = 1;
        }
    });

    updateProductDetails(variants[0]);
}

export { initializeVariantSelector };