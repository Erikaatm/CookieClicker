<?php
// Enviamos cabecera HTTP
header('Content-Type: application/json; charset=utf-8');

// CORS
// Permite que peticiones AJAX desde otro origen 
// puedan acceder a este backend sin que el navegador las bloquee.
if (isset($_SERVER['HTTP_ORIGIN'])) {

    // SANEAR ORIGIN (evita recargas infinitas en Chrome)
    $origin = filter_var($_SERVER['HTTP_ORIGIN'], FILTER_SANITIZE_URL);

    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type');
}

// Comprobamos si la peticion es OPTIONS, pregunta de prueba, 
// si lo es devolvemos 0, no queremos tocar los datos todavia
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    echo json_encode(['ok' => true]);
    exit(0);
}

// Nombre de nuestro archivo json donde se guarda la info de los usuarios
$archivo = 'usuarios.json';

// Verificamos que el archivo exsite y lo convertimos en un array asociativo
$usuarios = file_exists($archivo) ? json_decode(file_get_contents($archivo), true) : [];

// Guardamos el metodo HTTP en una variable
$method = $_SERVER['REQUEST_METHOD'];

// Método GET
if ($method === 'GET') {
    // Convertimos de array asociativo a JSON
    echo json_encode($usuarios);
    exit;
}

// Metodo POST
if ($method === 'POST') {
    // Leemos el contenido de POST y lo convertimos en array asociativo
    $datos = json_decode(file_get_contents('php://input'), true);

    // Comprobamos duplicados
    $hayDuplicado = false;
    $camposDuplicados = [];

    foreach ($usuarios as $u) {
        if ($u['username'] === $datos['username']) {
            $hayDuplicado = true;
            $camposDuplicados[] = 'username';
        }
        if ($u['email'] === $datos['email']) {
            $hayDuplicado = true;
            $camposDuplicados[] = 'email';
        }
        if ($u['phone'] === $datos['phone']) {
            $hayDuplicado = true;
            $camposDuplicados[] = 'phone';
        }
    }

    if ($hayDuplicado) {
        echo json_encode([
            'error' => true,
            'mensaje' => 'Ya existe un usuario con esos datos',
            'camposDuplicados' => $camposDuplicados
        ]);
        exit;
    }

    // Añadimos un nuevo usuario al final del array
    $usuarios[] = $datos;

    // Guardamos todos lo usuarios incluido el nuevo en el archivo JSON, 
    // para actualizar los datos
    file_put_contents($archivo, json_encode($usuarios, JSON_PRETTY_PRINT));

    echo json_encode(['mensaje' => 'Usuario añadido correctamente']);
    exit;
}

// Método DELETE
if ($method === 'DELETE') {
    // Leemos el contenido de POST y lo convertimos en array asociativo
    $datos = json_decode(file_get_contents('php://input'), true);

    // Recorremos todo el array de usuarios y devolvemos solo los que cumplan la condicion
    $usuariosFiltrados = array_filter($usuarios, fn($u) => $u['email'] !== $datos['email']);

    // Guardamos el array de usuarios en el JSON
    file_put_contents($archivo, json_encode(array_values($usuariosFiltrados), JSON_PRETTY_PRINT));

    echo json_encode(['mensaje' => 'Usuario eliminado correctamente']);
    exit;
}

// Método PUT
if ($method === 'PUT') {
    // Leemos el contenido de POST y lo convertimos en array asociativo
    $datos = json_decode(file_get_contents('php://input'), true);

    // Buscamos en qué posición del array $usuarios está el usuario que 
    // queremos actualizar, usando su email como identificador.
    $index = array_search($datos['email'], array_column($usuarios, 'email'));

    // Solo podemos actualizar el usuario si encontramos su email en el JSON, si no no hacemos nada
    if ($index !== false) {
        $usuarios[$index] = $datos;

        file_put_contents($archivo, json_encode($usuarios, JSON_PRETTY_PRINT));
        echo json_encode(['mensaje' => 'Usuario actualizado correctamente']);
    } else {
        echo json_encode(['error' => true, 'mensaje' => 'Usuario no encontrado']);
    }
    exit;

}
