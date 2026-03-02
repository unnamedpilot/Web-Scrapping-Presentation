Reveal.initialize({
    hash: true,
    slideNumber: true,
    transition: 'slide',
    plugins: [RevealHighlight],
    width: 1200,
    height: 700,
    margin: 0.1,
    minScale: 0.2,
    maxScale: 2.0
});

// ── Lluvia de afros ──
let afroLoaded = false;

function crearStickmans(svgText) {
    const bg = document.getElementById('afro-background');
    const cantidad = 25;

    for (let i = 0; i < cantidad; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'falling-afro';
        wrapper.innerHTML = svgText;

        const size = Math.random() * 80 + 30;       // 30px a 110px
        const leftPos = Math.random() * 100;
        const duration = Math.random() * 4 + 3;
        const delay = Math.random() * 5;
        const opacity = 0.3 + (size / 110) * 0.7;

        const rotation = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 360 + 90);
        const blur = Math.max(0, (1 - size / 110) * 3); // 0px a 3px

        wrapper.style.cssText = `
            position: absolute;
            width: ${size}px;
            left: ${leftPos}%;
            opacity: ${opacity};
            filter: invert(1) blur(${blur.toFixed(1)}px);
            animation: caer-afro-${i} ${duration}s linear ${delay}s infinite backwards;
        `;

        const styleTag = document.createElement('style');
        styleTag.textContent = `
            @keyframes caer-afro-${i} {
                0%   { transform: translateY(-200px) rotate(0deg); }
                100% { transform: translateY(calc(100vh + 200px)) rotate(${rotation}deg); }
            }
        `;
        document.head.appendChild(styleTag);

        bg.appendChild(wrapper);
    }
}

Reveal.on('slidechanged', event => {
    const bg = document.getElementById('afro-background');

    if (event.currentSlide && event.currentSlide.id === 'afro-bg-slide') {
        bg.style.display = 'block';

        if (!afroLoaded) {
            afroLoaded = true;
            fetch('stick-afro.svg')
                .then(res => res.text())
                .then(svgText => crearStickmans(svgText));
        }
    } else {
        bg.style.display = 'none';
    }
});

// Mostrar la lluvia también al cargar si la primera slide está activa
Reveal.on('ready', event => {
    if (event.currentSlide && event.currentSlide.id === 'afro-bg-slide') {
        document.getElementById('afro-background').style.display = 'block';
        if (!afroLoaded) {
            afroLoaded = true;
            fetch('stick-afro.svg')
                .then(res => res.text())
                .then(svgText => crearStickmans(svgText));
        }
        // Disparar la animación del ladrón
        animarLadron();
    }
});

// ── Ladrón de letras ──
let thiefAnimated = false;

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Dibuja la cuerda entre el stickman y la letra objetivo.
 * Calcula dinámicamente el ángulo y la longitud según las posiciones reales en pantalla.
 */
function dibujarCuerda(stickman, letra) {
    const rope = document.getElementById('thief-rope');
    const sRect = stickman.getBoundingClientRect();
    const lRect = letra.getBoundingClientRect();

    // Origen de la cuerda: mano derecha del stickman (borde derecho, mitad vertical)
    const ox = sRect.right;
    const oy = sRect.top + sRect.height * 0.38;

    // Destino: centro de la letra
    const dx = lRect.left + lRect.width / 2;
    const dy = lRect.top + lRect.height / 2;

    const length = Math.hypot(dx - ox, dy - oy);
    const angle = Math.atan2(dy - oy, dx - ox) * (180 / Math.PI);

    rope.style.left = ox + 'px';
    rope.style.top = oy + 'px';
    rope.style.width = '0';
    rope.style.transform = `rotate(${angle}deg)`;
    rope.style.opacity = '1';

    // Forzar reflow para que la transición de width arranque desde 0
    rope.getBoundingClientRect();
    rope.style.width = length + 'px';
}

async function animarLadron() {
    if (thiefAnimated) return;
    thiefAnimated = true;

    const stickman = document.getElementById('thief-stickman');
    const rope = document.getElementById('thief-rope');
    // Robamos la letra 'e' (index 1)
    const letraObj = document.getElementById('letter-1');

    // ── Paso 1: Stickman aparece y entra desde la izquierda ──
    await wait(1800);                    // pausa inicial antes de que empiece
    stickman.style.opacity = '1';
    stickman.style.left = '8%';         // llega cerca del título
    await wait(1000);                    // espera a que llegue

    // ── Paso 2: Dibuja la cuerda hacia la letra objetivo ──
    dibujarCuerda(stickman, letraObj);
    await wait(600);                     // cuerda se extiende

    // ── Paso 3: Clonar la letra en body para animarla fuera del transform de Reveal ──
    //
    // Por qué un clon: position:fixed dentro del transform de Reveal
    // se posiciona relativo al slide, no al viewport. Al crear el clon
    // directamente en body (sin transform) las coordenadas son viewport reales.
    // El clon recibe todos los estilos visuales calculados explícitamente.

    const lRect = letraObj.getBoundingClientRect();
    const sRect = stickman.getBoundingClientRect();

    // Capturar TODOS los estilos visuales antes de cualquier cambio
    const revealScale = Reveal.getScale();
    const cs = window.getComputedStyle(letraObj);
    const visualFontSize = parseFloat(cs.fontSize) * revealScale;

    // Crear clon en body con todos los estilos necesarios
    const clone = document.createElement('span');
    clone.textContent = letraObj.textContent;
    clone.style.cssText = `
        position: fixed;
        left: ${lRect.left}px;
        top:  ${lRect.top}px;
        font-size:   ${visualFontSize}px;
        font-family: ${cs.fontFamily};
        font-weight: ${cs.fontWeight};
        font-style:  ${cs.fontStyle};
        color:       ${cs.color};
        text-shadow: ${cs.textShadow};
        letter-spacing: ${cs.letterSpacing};
        text-transform: ${cs.textTransform};
        line-height: 1;
        z-index: 11;
        pointer-events: none;
        transition: none;
    `;
    document.body.appendChild(clone);

    // Ocultar el original (el placeholder en el h1 ya reserva el espacio)
    letraObj.style.visibility = 'hidden';

    // Dos frames para que el browser pinte la posición inicial del clon
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    // Animar el clon hacia el stickman
    clone.style.transition = 'left 0.5s ease, top 0.4s ease';
    clone.style.left = (sRect.right + 4) + 'px';
    clone.style.top = (sRect.top + sRect.height * 0.1) + 'px';

    await wait(550);

    // ── Paso 4: Stickman y letra (el clon) huyen hacia la izquierda ──
    stickman.style.transition = 'left 0.9s cubic-bezier(0.4, 0, 1, 1), opacity 0.3s ease';
    stickman.style.left = '-150px';

    // Ahora es el clon quien sigue al stickman
    clone.style.transition = 'left 0.9s cubic-bezier(0.4, 0, 1, 1), opacity 0.5s ease';
    clone.style.left = '-200px';

    // La cuerda desaparece
    rope.style.opacity = '0';

    await wait(700);
    stickman.style.opacity = '0';
    clone.style.opacity = '0';

    // ── Paso 5: Las letras restantes cierran el hueco suavemente ──
    await wait(300);
    // Eliminar el clon completamente del DOM
    if (clone.parentNode) clone.parentNode.removeChild(clone);

    // Retirar la letra original del flujo para que las demás se junten
    letraObj.style.display = 'none';

    // Animar el cierre del hueco suavemente con una transición en el contenedor
    const titulo = document.getElementById('main-title-container');
    titulo.style.transition = 'letter-spacing 0.5s ease';
}
