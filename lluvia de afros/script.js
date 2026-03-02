Reveal.initialize({ hash: true });

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

        // Rotación aleatoria: cada muñeco gira su propio ángulo (entre -360 y 360)
        const rotation = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 360 + 90);

        // Blur inversamente proporcional al tamaño: pequeños más borrosos
        const blur = Math.max(0, (1 - size / 110) * 3); // 0px a 3px

        wrapper.style.cssText = `
      position: absolute;
      width: ${size}px;
      left: ${leftPos}%;
      opacity: ${opacity};
      filter: blur(${blur.toFixed(1)}px);
      animation: caer-${i} ${duration}s linear ${delay}s infinite backwards;
    `;

        // Keyframe único por muñeco con su propia rotación
        const styleTag = document.createElement('style');
        styleTag.textContent = `
      @keyframes caer-${i} {
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
