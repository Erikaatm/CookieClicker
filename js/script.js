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
            upgrades: []
        };

        usuarios.push(nuevoUsuario);
        localStorage.setItem("usuarios", JSON.stringify(usuarios));

        // Limpiar el formulario después del registro
        this.reset();
        $("input").removeClass("error");
        alert("Usuario registrado correctamente ✅");

        // Volvemos al login
        $('#register-container').hide();
        $('#login-container').fadeIn();
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


    // Si le damos click al enlace se cambia de contenedor
    $('#show-register').on('click', function(e) {
        e.preventDefault();
        $('#login-container').hide();
        $('#register-container').fadeIn();
    });

    $('#show-login').on('click', function(e) {
        e.preventDefault();
        $('#register-container').hide();
        $('#login-container').fadeIn();
    });


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
        $("#login-container").hide();
        $("#game-container").fadeIn();

        // Mostramos la galleta que elegimos
        $('#main-cookie').attr("src", getCookieImage(usuarioEncontrado.cookieType));


        // Lógica del cookieClicker
        // Inicializamos el juego al iniciar sesión
        let currentUser = usuarioEncontrado;
        let cookieCount = currentUser.cookies || 0;
        let CPC = 1;

        // Mostramos las cookies actuales
        $("#cookie-count").text(cookieCount);

        // AL hacer click en la galleta principal sumamos 1 a las cookies totales
        $("#main-cookie").on('click', function(e) {
            cookieCount += CPC;
            $("#cookie-count").text(cookieCount);

            // Y hacemos un pequeño efecto visual
            $(this).css("transform", "scale(0.95)");
            setTimeout(() => $(this).css("transform", "scale(1)"), 100);

            // Guardamos en el localstorage
            currentUser.cookies = cookieCount;
            saveProgress(currentUser);
        });
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