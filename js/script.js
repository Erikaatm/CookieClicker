// login.html
$(document).ready(function() {
    // Lógica del login
    $('#login-form').on('submit', function(e) {
        e.preventDefault();
        // Limpiamos
        $("input").removeClass("error");

        // Cogemos los datos del login
        const emailLogin = $('#emailLogin').val();
        const passwordLogin = $('#passwordLogin').val();

        // recuperamos lols usuarios
        const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

        // Buscamos el usuario en nuestro array
        const usuarioEncontrado = usuarios.find(u => u.email === emailLogin && u.password === passwordLogin);

        // Comprobamos si está
        if (!usuarioEncontrado) {
            // Si la contraseña o el email son incorrectos ponemos la clase de error
            $('#emailLogin, #passwordLogin').addClass('error');
            alert("Usuario o contraseña incorrectos ❌");
            return;
        }

        // Guardamos la sesión que está activa 
        localStorage.setItem('currentUser', JSON.stringify(usuarioEncontrado));

        alert(`Bienvenido ${usuarioEncontrado.username} 🍪`);
        window.location.href = 'index.html';

    });

});

// Funciones
// Funcion para coger la imagen del registro
function getCookieImage(type) {
    switch (type) {
        case "Cookie Chips":
            return "assets/cookieChips.png";
        case "Cookie Cat":
            return "assets/cookieCat.png";
        case "Tarta Mine":
            return "assets/tartaMine.png";
        default:
            return "assets/cookieChips.png";
    }
}

// Funcion para guardar el progreso del juego
function saveProgress(user) {
    let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const index = usuarios.findIndex(u => u.email === user.email);

    if (index !== -1) {
        usuarios[index] = user;
        localStorage.setItem("usuarios", JSON.stringify(usuarios));
    }

    localStorage.setItem("currentUser", JSON.stringify(user));
}

// Funcion para cargar los upgrades que tenemos
function renderUpgrades(game, upgrades) {
    $("#upgrade-list").html(""); // Limpiamos la lista
    upgrades.forEach(upg => {
        $("#upgrade-list").append(upg.mostrarUpgrades(game)); // Añadimos cada upgrade
    });
}

//Register.html
$(document).ready(function() {

    $("#menor-data").show();

    // Logica del registro
    $('#register-form').on('submit', function(e) {
        e.preventDefault();
        $("input").removeClass("error");

        // Cargamos los usuarios existentes en nuestro localstorage
        let usuarios = JSON.parse(localStorage.getItem('usuarios')) || []; // Si no hay nada creamos un array vacio

        // Recogemos los datos del formulario
        const isAdult = $("#isAdult").is(":checked");
        const username = $("#username").val().trim();
        const password = $("#password").val().trim();
        const phone = isAdult ? $("#phone").val().trim() : $("#phonePadres").val().trim();
        const email = isAdult ? $("#email").val().trim() : $("#emailPadres").val().trim();
        const cookieType = $('input[name="cookieType"]:checked').val();

        if (!cookieType) {
            alert("Por favor, elige un tipo de galleta 🍪");
            return;
        }
        // No hacemos validaciones pq lo hemos puesto requerido

        let hayDuplicado = false;

        // Comprobamos si existe el usuario 
        const duplicadoUsername = usuarios.find(u => u.username === username);
        const duplicadoEmail = usuarios.find(u => u.email === email);
        const duplicadoPhone = usuarios.find(u => u.phone === phone);

        if (duplicadoUsername) {
            $("#username").addClass("error");
            hayDuplicado = true;
        }

        if (duplicadoEmail) {
            if (isAdult) {
                $("#email").addClass("error");
            } else {
                $("#emailPadres").addClass("error");
            }
            hayDuplicado = true;
        }

        if (duplicadoPhone) {
            if (isAdult) {
                $("#phone").addClass("error");
            } else {
                $("#phonePadres").addClass("error");
            }
            hayDuplicado = true;
        }

        // Si esta duplicado
        if (hayDuplicado) {
            alert("Ya existe un usuario con esos datos. Corrige los campos marcados.");
            return;
        }

        // Creamos el nuevo usuario
        const nuevoUsuario = {
            username,
            password,
            isAdult,
            email,
            phone,
            cookieType,
            cookies: 0,
            cookiesPerSecond: 0,
            cookiesPerClick: 1,
            upgrades: []
        };

        usuarios.push(nuevoUsuario);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        // Limpiar el formulario después del registro
        this.reset();
        $("input").removeClass("error");
        alert("Usuario registrado correctamente ✅");

        // Volvemos al login
        window.location.href = 'login.html';
    });


    // Alternar el formulario de mayores y menores
    $('#isAdult').on('change', function() {
        if ($(this).is(':checked')) {
            // Adulto
            $('#adult-data').show();
            $('#menor-data').hide();

            // Activar required solo en adulto
            $('#phone, #email').prop('required', true);
            $('#phonePadres, #emailPadres').prop('required', false);
        } else {
            // Menor
            $('#adult-data').hide();
            $('#menor-data').show();

            // Activar required solo en menores
            $('#phone, #email').prop('required', false);
            $('#phonePadres, #emailPadres').prop('required', true);
        }
    });

});


// index.html
$(document).ready(function() {
    const usuarioEncontrado = JSON.parse(localStorage.getItem('currentUser'));
    if (!usuarioEncontrado) {

        return;
    }

    $('#user-name').text(usuarioEncontrado.username);
    // Mostramos la galleta que elegimos
    $('#main-cookie').attr("src", getCookieImage(usuarioEncontrado.cookieType));

    // Iniciamos el juego
    const game = new Game(usuarioEncontrado);
    game.start();

    // Logica de los upgrades
    // Lista de algunos de ellos
    const upgrades = [
        new Upgrade("Cursor", 10, 20, "assets/pointer1.jpg"),
        new Upgrade("Abuela", 0, 20, "assets/abuela.png", 1)

    ];

    // Hover dinámico para upgrades
    $("#upgrade-list").on("mouseenter", ".upgrade-item", function() {
        const name = $(this).data("name");
        const upgrade = upgrades.find(u => u.name === name);
        if (!upgrade) return;

        // Detectamos qué aumenta
        let message = "";
        if (upgrade.cpsIncrease && upgrade.cpsIncrease > 0) {
            message = `Añade +${upgrade.cpsIncrease} CPS 🍪`;
        } else if (upgrade.cpcIncrease && upgrade.cpcIncrease > 0) {
            message = `Añade +${upgrade.cpcIncrease} CPC 🍪`;
        } else {
            message = `Mejora disponible 🍪`;
        }

        // Creamos tooltip
        if (!$(this).find(".tooltip").length) {
            $(this).append(`<span class="tooltip" style="
            position: absolute; 
            background: #333; 
            color: #fff; 
            padding: 2px 6px; 
            border-radius: 4px; 
            top: -25px; 
            left: 0;
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
        ">${message}</span>`);
        }
    });

    // Quitamos el tooltip al salir
    $("#upgrade-list").on("mouseleave", ".upgrade-item", function() {
        $(this).find(".tooltip").remove();
    });


    // Quitamos el tooltip al salir
    $("#upgrade-list").on("mouseleave", ".upgrade-item", function() {
        $(this).find(".tooltip").remove();
    });

    // Cargamos el precio nuevo al iniciar el login
    const savedUpgrades = usuarioEncontrado.upgrades || [];

    // Recooremos el array de los upgrades que tenemos comprados
    for (const savedUpg of savedUpgrades) {
        // Busca el objeto de mejora correspondiente en la lista base del juego.
        const baseUpg = upgrades.find(u => u.name === savedUpg.name);

        // Si la mejora base existe, aplica los valores guardados.
        if (baseUpg) {
            baseUpg.price = savedUpg.price; // Actualiza el precio
            baseUpg.quantity = savedUpg.quantity; // Actualiza la cantidad
        }
    }

    // guarda referencias globales para fácil acceso
    window.game = game;
    window.upgrades = upgrades;

    // render inicial
    renderUpgrades(game, upgrades);

    // Cuando hacemos click en un upgrade
    $("#upgrade-list").on('click', '.upgrade-item', function() {
        const name = $(this).data('name'); // Cogemos el nombre de la mejora clicada
        const upgrade = upgrades.find(u => u.name === name); // Buscamos la instancia
        if (upgrade.buyUpgrades(game)) { // Intentamos comprarla
            renderUpgrades(game, upgrades); // Actualizamos la UI
        }
    });

    $('#user-name').text(usuarioEncontrado.username);

    // Boton de log out
    $('#logout-btn').on('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });

});