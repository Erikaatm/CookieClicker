// game.js
class Game {
    constructor(user) {
        this.user = user;
        this.cookies = parseInt(user.cookies) || 0;
        this.cps = parseInt(user.cookiesPerSecond) || 0;
        this.cpc = parseInt(user.cookiePerClick) || 1; // cookies por click
        this.intervalId = null;

        // Sonido
        this.clickSound = new Howl({ src: ['assets/koekie-44620.mp3'], volume: 0.5 });
    }

    // Funcion para añadir cookies
    addCookies(amount) {
        this.cookies += amount;
        $("#cookie-count").text(this.cookies);
        this.user.cookies = this.cookies;
        saveProgress(this.user);

        renderUpgrades(this, window.upgrades);

    }

    // Funcion para actualizar las cps
    updateCPSDisplay() {
        $("#cps").text(this.cps);
        $("#cpc").text(this.cpc);
    }



    start() {
        // Click sobre la cookie
        $("#main-cookie").on('click', (e) => {
            // Usamos this.addCookies para llamar al método de la instancia
            this.addCookies(this.cpc);
            this.clickSound.play();

            // Efecto visual
            $("#main-cookie").css("transform", "scale(0.95)");
            setTimeout(() => $("#main-cookie").css("transform", "scale(1)"), 100);
        });

        // Mostrar CPS actual
        this.updateCPSDisplay();

        // Reiniciar interval si existe
        if (this.intervalId) clearInterval(this.intervalId);

        // CPS automático
        this.intervalId = setInterval(() => {
            this.addCookies(this.cps);
        }, 1000);

    }
}