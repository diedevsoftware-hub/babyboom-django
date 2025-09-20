// static/js/components/minicart.js

// Función para obtener el token CSRF de las cookies
function getCsrfToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}

// Función principal para actualizar la VISTA del mini-carrito
function updateMiniCartView() {
    const miniCartContent = document.getElementById('mini-cart-content');
    const miniCartTotal = document.getElementById('mini-cart-total');
    const miniCartFooter = document.querySelector('.mini-cart-footer');

    fetch('/cart/api/data/')
        .then(response => response.json())
        .then(data => {
            miniCartContent.innerHTML = ''; // Limpiamos el contenido actual

            if (data.items.length === 0) {
                miniCartContent.innerHTML = '<div class="mini-cart-empty"><p>Tu carrito está vacío.</p></div>';
                miniCartFooter.style.display = 'none'; // Ocultamos el footer si está vacío
            } else {
                data.items.forEach(item => {
                    const itemHTML = `
                        <div class="mini-cart-item">
                            <img src="${item.image_url}" alt="${item.product_name}" class="mini-cart-item-img">
                            <div class="mini-cart-item-details">
                                <div class="mini-cart-item-info">
                                    <p class="name">${item.product_name} (${item.variant_color || ''})</p>
                                    <p class="price">S/ ${item.price}</p>
                                </div>
                                <div class="mini-cart-item-actions">
                                    <div class="quantity-control">
                                        <input type="number" class="mini-cart-quantity-input" value="${item.quantity}" min="0" data-variant-id="${item.variant_id}" aria-label="Cantidad">
                                    </div>
                                    <button class="remove-item-btn" data-variant-id="${item.variant_id}" title="Eliminar producto">&times;</button>
                                </div>
                            </div>
                        </div>
                    `;
                    miniCartContent.innerHTML += itemHTML;
                });
                miniCartFooter.style.display = 'block'; // Mostramos el footer
            }
            
            // Actualizamos los totales en el mini-carrito y en el header
            miniCartTotal.textContent = `S/ ${data.total_price}`;
            document.getElementById('cart-total-items').textContent = data.total_items;
            const mobileCartCounter = document.getElementById('cart-total-items-mobile');
            if (mobileCartCounter) {
                mobileCartCounter.textContent = data.total_items;
            }
        })
        .catch(error => console.error('Error al cargar datos del mini-carrito:', error));
}

// Función que abre el carrito y actualiza su contenido
export function openMiniCart() {
    const miniCart = document.getElementById('mini-cart');
    const miniCartOverlay = document.getElementById('mini-cart-overlay');
    
    updateMiniCartView(); // Actualizamos el contenido cada vez que se abre

    if (miniCart && miniCartOverlay) {
        miniCart.classList.add('is-open');
        miniCartOverlay.classList.add('is-open');
    }
}


// Función para manejar las interacciones DENTRO del mini-carrito
function handleCartAction(variantId, action, quantity = 1) {
    let url = '';
    let body = `variant_id=${variantId}&csrfmiddlewaretoken=${getCsrfToken()}`;

    if (action === 'remove') {
        url = '/cart/api/remove/';
    } else if (action === 'update') {
        url = '/cart/api/update/';
        body += `&quantity=${quantity}`;
    } else {
        return; // No hacer nada si la acción no es reconocida
    }
    
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            // Si la acción fue exitosa, actualizamos la vista completa del carrito
            updateMiniCartView();
        }
    })
    .catch(error => console.error(`Error en la acción '${action}':`, error));
}


function initMiniCart() {
    const miniCart = document.getElementById('mini-cart');
    const miniCartOverlay = document.getElementById('mini-cart-overlay');
    const closeMiniCartBtn = document.getElementById('close-mini-cart');
    const miniCartContent = document.getElementById('mini-cart-content');

    function closeMiniCart() {
        if (miniCart && miniCartOverlay) {
            miniCart.classList.remove('is-open');
            miniCartOverlay.classList.remove('is-open');
        }
    }

    if (closeMiniCartBtn && miniCartOverlay) {
        // Asignamos el evento de abrir a todos los iconos de carrito
        document.querySelectorAll('.cart-icon').forEach(icon => {
            icon.addEventListener('click', function(event) {
                event.preventDefault();
                openMiniCart();
            });
        });

        // Eventos para cerrar
        closeMiniCartBtn.addEventListener('click', closeMiniCart);
        miniCartOverlay.addEventListener('click', closeMiniCart);
    }

    // Usamos delegación de eventos para manejar clics y cambios DENTRO del carrito
    if (miniCartContent) {
        miniCartContent.addEventListener('click', function(event) {
            const removeBtn = event.target.closest('.remove-item-btn');
            if (removeBtn) {
                const variantId = removeBtn.dataset.variantId;
                handleCartAction(variantId, 'remove');
            }
        });

        miniCartContent.addEventListener('change', function(event) {
            const quantityInput = event.target.closest('.mini-cart-quantity-input');
            if (quantityInput) {
                const variantId = quantityInput.dataset.variantId;
                const quantity = quantityInput.value;
                handleCartAction(variantId, 'update', quantity);
            }
        });
    }
}

export { initMiniCart };