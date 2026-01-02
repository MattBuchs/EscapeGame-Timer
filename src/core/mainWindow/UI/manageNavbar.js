const path = require("path");

const manageNavbarObj = {
    navbarExpanded: false,
    header: null,
    btnExpandNavbar: null,
    svgExpandNavbar: null,
    h1: null,
    btns: null,
    paragraphs: null,

    init() {
        // Sélectionner les éléments DOM après le chargement du HTML
        this.header = document.querySelector("#header-load");
        this.btnExpandNavbar = document.querySelector("#expand-navbar");
        this.svgExpandNavbar = document.querySelector(
            "#expand-navbar svg path"
        );
        this.h1 = document.querySelector(".header__logo h1");
        this.btns = document.querySelectorAll(".header__nav button");
        this.paragraphs = document.querySelectorAll(".header__nav span");

        if (!this.btnExpandNavbar) {
            console.error("Bouton expand-navbar non trouvé");
            return;
        }

        this.btnExpandNavbar.addEventListener(
            "click",
            this.expandNavbar.bind(this)
        );
        // header.addEventListener("mouseenter", this.expandNavbar.bind(this));
        // header.addEventListener("mouseleave", this.resetStyle.bind(this));

        window.addEventListener("resize", () => {
            if (window.matchMedia("(max-width: 700px)").matches)
                this.resetStyle();
        });
    },

    expandNavbar() {
        if (this.navbarExpanded) return this.resetStyle();

        setTimeout(() => {
            this.h1.style.display = "initial";
        }, 250);

        // Changer le SVG pour pointer vers la gauche (chevron-left)
        if (this.svgExpandNavbar) {
            this.svgExpandNavbar.setAttribute(
                "d",
                "M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"
            );
        }

        this.paragraphs.forEach((paragraph) => {
            paragraph.style.display = "initial";
        });

        this.btns.forEach((btn) => {
            btn.style.justifyContent = "start";
        });

        this.header.classList.add("navbar-anim");
        this.header.classList.remove("navbar-anim2");

        this.navbarExpanded = true;
    },

    resetStyle() {
        this.h1.style.display = "";

        // Changer le SVG pour pointer vers la droite (chevron-right)
        if (this.svgExpandNavbar) {
            this.svgExpandNavbar.setAttribute(
                "d",
                "M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"
            );
        }

        this.paragraphs.forEach((paragraph) => {
            paragraph.style.display = "";
        });

        this.btns.forEach((btn) => {
            btn.style.justifyContent = "";
        });

        this.header.classList.remove("navbar-anim");
        this.header.classList.add("navbar-anim2");

        this.navbarExpanded = false;
    },
};

export default manageNavbarObj;
