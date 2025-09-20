// static/js/components/search.js
function initSearch() {
const mobileSearchTrigger = document.getElementById('mobile-search-trigger');
const searchOverlay = document.getElementById('search-overlay');
const closeSearchOverlayBtn = document.getElementById('close-search-overlay');
const liveSearchInput = document.getElementById('live-search-input');
const liveSearchResults = document.getElementById('live-search-results');

let debounceTimer;

if (mobileSearchTrigger && searchOverlay && closeSearchOverlayBtn && liveSearchInput) {
    mobileSearchTrigger.addEventListener('click', function(event) {
        event.preventDefault();
        searchOverlay.classList.add('is-open');
        liveSearchInput.focus();
    });

    function closeSearch() {
        searchOverlay.classList.remove('is-open');
        liveSearchInput.value = '';
        liveSearchResults.innerHTML = '';
    }
    closeSearchOverlayBtn.addEventListener('click', closeSearch);

    liveSearchInput.addEventListener('input', function() {
        const query = this.value;
        clearTimeout(debounceTimer);
        
        if (query.length < 2) {
            liveSearchResults.innerHTML = '';
            return;
        }

        debounceTimer = setTimeout(() => {
            fetch(`/api/live-search/?term=${query}`)
                .then(response => response.json())
                .then(data => {
                    liveSearchResults.innerHTML = '';
                    if (data.products.length > 0) {
                        data.products.forEach(product => {
                            const item = document.createElement('a');
                            item.href = product.url;
                            item.classList.add('search-result-item');
                            item.innerHTML = `
                                <img src="${product.image_url}" alt="">
                                <span>${product.name}</span>
                            `;
                            liveSearchResults.appendChild(item);
                        });
                    } else {
                        liveSearchResults.innerHTML = '<div class="no-results">No se encontraron productos para tu búsqueda.</div>';
                    }
                })
                .catch(error => console.error("Error en la búsqueda en vivo:", error));
        }, 300);
    });
}

}
export { initSearch };