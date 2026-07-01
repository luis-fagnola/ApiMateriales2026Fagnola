// Maneja el estado visual del menu superior.
window.addEventListener("DOMContentLoaded", () => {
    // Detecta la ruta actual de la pagina.
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll(".navbar .nav-link");

    // Recorre los enlaces para activar el que corresponde.
    navLinks.forEach((link) => {
        const href = (link.getAttribute("href") || "").toLowerCase();
        const isHomeLink = href === "/inicio.html";
        const isHomePath = currentPath === "/" || currentPath === "/index.html";
        const isActive = href && (currentPath === href || currentPath.endsWith(href) || (isHomeLink && isHomePath));
        if (isActive) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }

        // En mobile, cierra el menu al seleccionar una opcion.
        link.addEventListener("click", () => {
            const openCollapse = document.querySelector(".navbar .navbar-collapse.show");
            if (openCollapse) {
                const instance = bootstrap.Collapse.getOrCreateInstance(openCollapse);
                instance.hide();
            }
        });
    });
});
