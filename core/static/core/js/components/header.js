// static/js/components/header.js (VERSIÓN CON LÓGICA INVERTIDA)

function initHeader() {
    // 1. Buscamos los elementos clave
    const header = document.querySelector('.main-header');
    const heroSection = document.querySelector('.hero-section'); // El contenedor del video
    const hamburger = document.querySelector('.navbar-hamburger');
    const navLinks = document.querySelector('.navbar-links');

    // 2. Lógica principal de scroll (INVERTIDA)
    // Si estamos en una página que TIENE el video (el homepage)...
    if (header && heroSection) {
        const firstContentSection = heroSection.nextElementSibling;
        
        if (firstContentSection) {
            // Calculamos el punto exacto donde el header debe volver a ser sólido
            const triggerPoint = firstContentSection.offsetTop - header.offsetHeight;

            // Función para actualizar el header según el scroll
            const handleScroll = () => {
                const scrollY = window.scrollY;

                // Condición 1: Estamos en la parte de arriba del todo.
                // El header debe ser SÓLIDO.
                if (scrollY === 0) {
                    header.classList.remove('is-transparent');
                
                // Condición 2: Hemos hecho scroll pero AÚN NO llegamos a la siguiente sección.
                // El header debe ser TRANSPARENTE.
                } else if (scrollY > 0 && scrollY < triggerPoint) {
                    header.classList.add('is-transparent');

                // Condición 3: Ya pasamos el video y llegamos al contenido.
                // El header debe volver a ser SÓLIDO.
                } else {
                    header.classList.remove('is-transparent');
                }
            };

            // Ejecutamos la función una vez al cargar por si la página carga a mitad de scroll
            handleScroll(); 
            // Y la escuchamos en cada evento de scroll
            window.addEventListener('scroll', handleScroll);
        }
    } 
    // Si estamos en CUALQUIER OTRA página (que no tiene video)...
    else if (header) {
        // El header es sólido por defecto gracias al CSS, no necesitamos hacer nada aquí.
        // No se añade ninguna clase especial.
    }

    // 3. Lógica del menú hamburguesa (esta no cambia)
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
}

export { initHeader };