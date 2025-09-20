// static/js/pages/product-detail.js

import { initializeVariantSelector } from '/static/core/js/modules/product-variants.js';

// Definimos los IDs para la página principal
const mainPageIds = {
    mainImage: 'main-product-image',
    thumbnailGallery: 'thumbnail-gallery',
    colorSwatches: 'color-swatches',
    price: 'product-price',
    stock: 'product-stock',
    addToCartBtn: 'add-to-cart-btn',
    quantityInput: 'quantity-input'
};

// Llamamos a la función con los IDs correctos
initializeVariantSelector('body', mainPageIds, 'variants-data');