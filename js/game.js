// game.js
class Game {
    constructor(user) {
        this.user = user;
        this.cookies = parseInt(user.cookies) || 0;
        this.cps = parseInt(user.cookiesPerSecond) || 0;
        this.cpc = parseInt(user.cookiesPerClick) || 1;
        this.intervalId = null;
        this.saveTimeout = null;

        // Sonido
        this.clickSound = new Howl({ src: ['assets/koekie-44620.mp3'], volume: 0.5 });
    }

    // Función para añadir cookies
    addCookies(amount) {
        this.cookies += amount;
        $("#cookie-count").text(this.cookies);
        this.user.cookies = this.cookies;

        // Guardamos SOLO la UI localmente, no el servidor
        this.updateLocalStorage();

        // Programamos guardado en servidor
        this.scheduleServerSave();

        renderUpgrades(this, window.upgrades);
    }

    // Actualiza localStorage sin tocar el servidor
    updateLocalStorage() {
        localStorage.setItem('currentUser', JSON.stringify(this.user));
    }

    // Guarda en el servidor solo cada 5 segundos
    scheduleServerSave() {
        // Cancelamos el guardado anterior si existe
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }

        // Programamos un nuevo guardado en 5 segundos
        this.saveTimeout = setTimeout(() => {
            this.saveToServer();
        }, 5000);
    }

    saveToServer() {
        $.ajax({
            url: 'backend/api.php',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(this.user),
            success: function() {
                console.log("Progreso guardado en servidor");
            },
            error: function() {
                console.error("Error al guardar progreso");
            }
        });
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

    // Método para guardar antes de cerrar
    saveBeforeExit() {
        // Cancelamos el timeout pendiente
        if (this.saveTimeout) {
            clearTimeout(this.saveTimeout);
        }
        // Guardamos inmediatamente
        this.saveToServer();
    }
}