window.addEventListener("DOMContentLoaded", function() {
    const nav = document.getElementById("fixed-top-nav");
    const mainNav = document.getElementById("main-nav");

    if (!mainNav || !nav) {
        return;
    }
    
    mainNav.addEventListener("show.bs.collapse", () => {
        nav.classList.add("nav-expanded");
    });
    
    mainNav.addEventListener("hide.bs.collapse", (e) => {
        if (e.target !== mainNav) {
            return;
        }
        nav.classList.remove("nav-expanded");
    });
});