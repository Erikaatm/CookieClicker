// Este es el código para las particulas de las galletas
$(document).ready(function() {
    tsParticles.load("tsparticles", {
        fullScreen: { enable: false }, // solo dentro del div
        particles: {
            number: { value: 40, density: { enable: true, area: 300 } },
            shape: {
                type: "image",
                image: [
                    { src: "assets/cookieChips.png", width: 20, height: 20 },
                    { src: "assets/cookieCat.png", width: 20, height: 20 },
                    { src: "assets/tartaMine.png", width: 20, height: 20 }
                ]
            },
            size: { value: { min: 10, max: 25 } },

            move: {
                enable: true,
                speed: 2,
                direction: "bottom",
                outModes: "out",
            },
            opacity: { value: { min: 0.6, max: 1 } }
        },
        detectRetina: true
    });
});