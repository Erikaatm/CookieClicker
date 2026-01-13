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

        $.ajax({
            url: 'backend/api.php',
            method: 'GET',
            success: function(usuarios) {
                const usuarioEncontrado = usuarios.find(u => u.email === emailLogin && u.password === passwordLogin);

                if (!usuarioEncontrado) {
                    $('#emailLogin, #passwordLogin').addClass('error');
                    alert("Usuario o contraseña incorrectos ❌");
                    return;
                }

                localStorage.setItem('currentUser', JSON.stringify(usuarioEncontrado));
                alert(`Bienvenido ${usuarioEncontrado.username} 🍪`);
                window.location.href = 'index.html';
            },
            error: function() {
                alert("Error al conectar con el servidor ❌");
            }
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
    $.ajax({
        url: 'backend/api.php',
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(user),
        success: function() {
            localStorage.setItem('currentUser', JSON.stringify(user));
        },
        error: function() {
            console.error("Error al guardar progreso");
        }
    });
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

        $.ajax({
            url: 'backend/api.php',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(nuevoUsuario),
            success: function(respuesta) {
                if (respuesta.error) {
                    // Si el backend detecta duplicados, mostramos los campos en error
                    if (respuesta.errorFields) {
                        respuesta.errorFields.forEach(f => {
                            $(`#${f}`).addClass("error");
                        });
                    }
                    alert(respuesta.mensaje); // "Ya existe un usuario con esos datos"
                    return;
                }

                alert(respuesta.mensaje); // "Usuario añadido correctamente"
                $('#register-form')[0].reset(); // Limpiamos formulario
                window.location.href = 'login.html';
            },
            error: function() {
                alert("Error al registrar el usuario ❌");
            }
        });
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

    $('#user-name').on('click', function() {
        window.location.href = 'userInfo.html';
    });

    // Guardamos antes de cerrar la ventana o cambiar de página
    $(window).on('beforeunload', function() {
        if (window.game) {
            window.game.saveBeforeExit();
        }
    });

    // Guardamos al hacer logout
    $('#logout-btn').on('click', function() {
        if (window.game) {
            window.game.saveBeforeExit();
        }
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
});


// Ir a la pagina del usuario
$(document).ready(function() {
    const usuarioEncontrado = JSON.parse(localStorage.getItem('currentUser'));
    if (!usuarioEncontrado) {

        return;
    }

    // Ya puedes usar currentUser sin problemas
    $("#profile-username").text(usuarioEncontrado.username);
    $("#profile-email").text(usuarioEncontrado.email);
    $("#profile-phone").text(usuarioEncontrado.phone);



    // Editar username con doble click
    $("#profile-username").on("dblclick", function() {
        const valorActual = $(this).text().trim();

        showEditor("username", valorActual, function(nuevoValor) {
            // Actualizamos el texto que es visible
            $("#profile-username").text(nuevoValor);

            // Actualizamos el localStorage
            usuarioEncontrado.username = nuevoValor;
            localStorage.setItem("currentUser", JSON.stringify(usuarioEncontrado));

            // Enviamos al backend con un PUT
            $.ajax({
                url: 'backend/api.php',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(usuarioEncontrado),
                success: function(respuesta) {
                    alert("Usuario actualziado correctamente. :)");

                },
                error: function() {
                    alert("Error al actualizar el usuario.");
                }
            })
        });

    });

    // Editar telefono con doble click
    $("#profile-phone").on("dblclick", function() {
        const valorActual = $(this).text().trim();

        showEditor("teléfono", valorActual, function(nuevoValor) {
            $("#profile-phone").text(nuevoValor);

            usuarioEncontrado.phone = nuevoValor;
            localStorage.setItem("currentUser", JSON.stringify(usuarioEncontrado));
        });
    });

    // Cambiar contraseña
    $('#change-password-btn').on('click', function() {
        showPasswordEditor(function(actual, nueva) {

            if (actual !== usuarioEncontrado.password) {
                alert("La contraseña actual no es correcta.");
                return;
            }

            usuarioEncontrado.password = nueva;
            localStorage.setItem("currentUser", JSON.stringify(usuarioEncontrado));

            $.ajax({
                url: 'backend/api.php',
                method: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(usuarioEncontrado),
                success: function() {
                    alert("Contraseña actualizada correctamente :)");
                },
                error: function() {
                    alert("Error al actualizar la contraseña.");
                }
            });
        });
    });

    // Elñiminar cuenta
    $('#btn-delete').on('click', function() {
        showDeleteEditor(function(passwordIntroducida) {
            // Comprobamos
            if (passwordIntroducida === usuarioEncontrado.password) {
                // Petición DELETE al backend
                $.ajax({
                    url: 'backend/api.php',
                    method: 'DELETE',
                    contentType: 'application/json',
                    data: JSON.stringify({ email: usuarioEncontrado.email, password: passwordIntroducida }),
                    success: function(respuesta) {
                        // Eliminamos
                        localStorage.removeItem('currentUser');
                        alert("Cuenta eliminada correctamente.");
                        window.location.href = 'login.html';
                    },
                    error: function() {
                        alert("Error al eliminar la cuenta.");
                    }
                });
            } else {
                alert("Contraseña incorrecta.");
            }
        });
    });

    // Boton para volver

    $("#back-btn").on("click", function() {
        window.location.href = 'index.html';
    });

});




// Mostrar editor info personal

function showEditor(field, value, onSave) {
    // Creamos el overlay
    const overlay = $('<div class="editor-overlay"></div>');
    const editor = $(`
        <div class="editor-container">
            <h3>Editar ${field}</h3>
            <input type="text" id="editor-input" value="${value}" />
            <div>
                <button id="btn-accept">Aceptar</button>
                <button id="btn-cancel">Cancelar</button>
            </div>
        </div>
    `);
    overlay.append(editor);
    $('body').append(overlay);

    // Focus en el input
    $("#editor-input").focus();

    // Cancelar
    $("#btn-cancel").on("click", function() {
        overlay.remove();
    });

    // Aceptar
    $("#btn-accept").on("click", function() {
        const newValue = $("#editor-input").val().trim();
        onSave(newValue);
        overlay.remove();
    });

}

// Mostrar editor contraseña

function showPasswordEditor(onSave) {
    // Creamos el overlay
    const overlay = $('<div class="editor-overlay"></div>');
    const editor = $(`
        <div class="editor-container">
            <h3>Cambiar Contraseña</h3>
            <input type="password" id="current-password" placeholder="Contraseña actual" />
            <input type="password" id="new-password" placeholder="Nueva contraseña" />
            <input type="password" id="confirm-password" placeholder="Confirmar nueva contraseña" />
            <div>
                <button id="btn-accept">Aceptar</button>
                <button id="btn-cancel">Cancelar</button>
            </div>
        </div>
    `);
    overlay.append(editor);
    $('body').append(overlay);

    // Focus en el primer input
    $("#current-password").focus();

    // Cancelar
    $("#btn-cancel").on("click", function() {
        overlay.remove();
    });

    // Aceptar
    $("#btn-accept").on("click", function() {
        const actual = $("#current-password").val().trim();
        const nueva = $("#new-password").val().trim();
        const confirm = $("#confirm-password").val().trim();

        // Validaciones básicas
        if (!actual || !nueva || !confirm) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        if (nueva !== confirm) {
            alert("La nueva contraseña y su confirmación no coinciden.");
            return;
        }

        // Ejecutamos la función pasada por parámetro
        onSave(actual, nueva);
        overlay.remove();
    });
}

// Función para mostrar el overlay de eliminación
function showDeleteEditor(onConfirm) {
    const overlay = $('<div class="editor-overlay"></div>');
    const editor = $(`
        <div class="editor-container">
            <h3>Eliminar Cuenta</h3>
            <p>Introduce tu contraseña para confirmar:</p>
            <input type="password" id="delete-password" placeholder="Contraseña" />
            <div>
                <button id="btn-accept">Eliminar</button>
                <button id="btn-cancel">Cancelar</button>
            </div>
        </div>
    `);
    overlay.append(editor);
    $('body').append(overlay);

    $('#delete-password').focus();

    // Cancelar
    $('#btn-cancel').on('click', function() {
        overlay.remove();
    });

    // Confirmar
    $('#btn-accept').on('click', function() {
        const password = $('#delete-password').val().trim();
        // Introducimos la contraseña
        if (!password) {
            alert("Introduce tu contraseña.");
            return;
        }
        onConfirm(password);
        overlay.remove();
    });
}