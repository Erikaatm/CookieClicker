class Upgrade {
    constructor(name, cpsIncrease, price, image, cpcIncrease) {
        this.name = name; // Nombre de la mejora
        this.cpsIncrease = parseInt(cpsIncrease) || 0; // Cuántas CPS añade
        this.price = parseInt(price) || 0; // Precio
        this.image = image; // Imagen de la mejora 
        this.cpcIncrease = parseInt(cpcIncrease) || 0; // Cuantas cpc añade
        this.quantity = 0;
    }

    // Funcion para comprar mejoras
    buyUpgrades(game) {
        const cookies = parseInt(game.cookies) || 0;
        const price = parseInt(this.price) || 0;
        const porcentajeAumentoPrecio = 1.55;

        if (cookies >= price) {
            game.cookies = cookies - price;
            this.quantity++;

            // Aplicamos mejoras
            game.cps = (parseInt(game.cps) || 0) + (parseInt(this.cpsIncrease) || 0);
            game.cpc = (parseInt(game.cpc) || 0) + (parseInt(this.cpcIncrease) || 0);

            const nuevoPrecio = this.price * porcentajeAumentoPrecio;
            // redondeamos
            this.price = Math.ceil(nuevoPrecio);

            // Actualizamos interfaz
            game.updateCPSDisplay();
            $("#cookie-count").text(game.cookies);

            // Guardamos progreso del usuario
            game.user.cookies = game.cookies;
            game.user.cookiesPerSecond = game.cps;
            game.user.cookiesPerClick = game.cpc;

            // Creamos o actualizamos el objeto upgrade que tenemos
            let userUpgrades = game.user.upgrades || [];
            const upgradesActualizar = {
                name: this.name,
                price: this.price, // Guardamos el precio actualizadp
                quantity: this.quantity
            }

            // Buscamos si ya existe esa mejora en el array del usuario
            const existingUpgrade = userUpgrades.findIndex(upg => upg.name === this.name);

            if (existingUpgrade !== -1) {
                // Actualizamos los upgrades
                userUpgrades[existingUpgrade] = upgradesActualizar;
            } else {
                // Si no lo añadimos
                userUpgrades.push(upgradesActualizar);
            }

            // Guardamos el array actualizado en el usuario
            game.user.upgrades = userUpgrades;

            game.updateLocalStorage();
            game.scheduleServerSave();

            return true;
        }
        return false;
    }

    // Generamos un html para mostrar los upgrades que hay
    mostrarUpgrades(game) {
        const canBuy = (parseInt(game.cookies) || 0) >= (parseInt(this.price) || 0);
        // Nos preguntamos si el susuario puede comprarlo, para habilitarselo o no
        return `
            <div class="upgrade-item ${canBuy ? '' : 'disabled'}" data-name="${this.name}">
                <img class="imgUpgrade" src="${this.image}" alt="${this.name}" />
                <p>${this.name}</p>
                <p>Precio: ${this.price}</p>
                
            </div>
        `;
    }
}