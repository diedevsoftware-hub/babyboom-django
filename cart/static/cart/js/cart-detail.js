// static/js/pages/cart-detail.js


function showStockAlert(message) {
    if (document.querySelector('.stock-alert-message')) return;
    const alertBox = document.createElement('div');
    alertBox.className = 'stock-alert-message';
    alertBox.textContent = message;
    document.body.appendChild(alertBox);
    setTimeout(() => { alertBox.classList.add('show'); }, 10);
    setTimeout(() => {
        alertBox.classList.remove('show');
        setTimeout(() => { alertBox.remove(); }, 300);
    }, 3000);
}

// Función para obtener el token CSRF del DOM
function getCsrfToken() {
    // Esta función ahora funcionará porque el token está en el HTML
    const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
    if (!csrfInput) {
        console.error("Error crítico: No se encontró el token CSRF en la página.");
        return null;
    }
    return csrfInput.value;
}

// Función para actualizar los contadores de carrito en el header
function updateHeaderCartCounters(totalItems) {
    document.getElementById('cart-total-items').textContent = totalItems;
    const mobileCartCounter = document.getElementById('cart-total-items-mobile');
    if (mobileCartCounter) {
        mobileCartCounter.textContent = totalItems;
    }
}

function initCartPage() {
    const cartContainer = document.getElementById('cart-page-container');
    if (!cartContainer) return;

    let debounceTimer;

    cartContainer.addEventListener('input', (event) => {
        if (event.target.classList.contains('quantity-input')) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const input = event.target;
                const cartItem = input.closest('.cart-item');
                const stock = parseInt(cartItem.dataset.stock);
                let quantity = Math.max(1, parseInt(input.value) || 1);
                
                if (quantity > stock) {
                    showStockAlert(`Solo quedan ${stock} unidades de este producto.`);
                    quantity = stock;
                    input.value = stock;
                }

                const variantId = cartItem.dataset.variantId;
                updateCartItem(variantId, quantity);
            }, 400);
        }
    });

    cartContainer.addEventListener('click', (event) => {
        const removeBtn = event.target.closest('.remove-link');
        const quantityBtn = event.target.closest('.quantity-btn');

        if (removeBtn) {
            event.preventDefault();
            const cartItem = removeBtn.closest('.cart-item');
            const variantId = cartItem.dataset.variantId;
            removeCartItem(variantId, cartItem);
        }

         if (quantityBtn) {
            const cartItem = quantityBtn.closest('.cart-item');
            const input = cartItem.querySelector('.quantity-input');
            const stock = parseInt(cartItem.dataset.stock);
            let currentValue = parseInt(input.value);

            if (quantityBtn.classList.contains('increase')) {
                if (currentValue < stock) {
                    currentValue++;
                } else {
                    showStockAlert(`¡Stock máximo alcanzado! (${stock} unidades)`);
                }
            } else if (quantityBtn.classList.contains('decrease')) {
                currentValue = Math.max(1, currentValue - 1);
            }
            
            if (parseInt(input.value) !== currentValue) {
                input.value = currentValue;
                const variantId = cartItem.dataset.variantId;
                updateCartItem(variantId, currentValue);
            }
        }
    });
}


function updateCartItem(variantId, quantity) {
    const csrfToken = getCsrfToken();
    if (!csrfToken) return;

    const formData = new FormData();
    formData.append('variant_id', variantId);
    formData.append('quantity', quantity);
    formData.append('csrfmiddlewaretoken', csrfToken);

    fetch('/cart/api/update/', {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            const cartItem = document.querySelector(`.cart-item[data-variant-id='${variantId}']`);
            if (cartItem) {
                cartItem.querySelector('.item-total-price').textContent = `S/ ${data.item_total_price}`;
            }
            document.getElementById('cart-subtotal').textContent = `S/ ${data.subtotal}`;
            document.getElementById('cart-total').textContent = `S/ ${data.subtotal}`;
            updateHeaderCartCounters(data.total_items);
        }
    })
    .catch(error => console.error('Error al actualizar el carrito:', error));
}

function removeCartItem(variantId, cartItemElement) {
    const csrfToken = getCsrfToken();
    if (!csrfToken) return;

    const formData = new FormData();
    formData.append('variant_id', variantId);
    formData.append('csrfmiddlewaretoken', csrfToken);

    fetch('/cart/api/remove/', {
        method: 'POST',
        body: new URLSearchParams(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            cartItemElement.style.opacity = '0';
            setTimeout(() => {
                cartItemElement.remove();
                if (document.querySelectorAll('.cart-item').length === 0) {
                    window.location.reload();
                }
            }, 300);

            document.getElementById('cart-subtotal').textContent = `S/ ${data.subtotal}`;
            document.getElementById('cart-total').textContent = `S/ ${data.subtotal}`;
            updateHeaderCartCounters(data.total_items);
        }
    })
    .catch(error => console.error('Error al eliminar del carrito:', error));
}

// Iniciar el script
initCartPage();