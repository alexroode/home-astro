window.addEventListener("DOMContentLoaded", function() {
    const nav = document.getElementById("fixed-top-nav");
    const mainNav = document.getElementById("main-nav");

    if (!mainNav || !nav) {
        return;
    }
    
    mainNav.addEventListener("show.bs.collapse", function () {
        nav.classList.add("nav-expanded");
    });
    mainNav.addEventListener("hide.bs.collapse", function (e) {
        if (e.target !== this) {
            return;
        }
        nav.classList.remove("nav-expanded");
    });
});