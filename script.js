/* ==========================================================================
   salmanjamil.me - Celestial Sky & Landscape Canvas Animation
   ========================================================================== */

(function () {
  const canvas = document.getElementById('skyCanvas');
  const ctx = canvas.getContext('2d');

  let width, height;
  let stars = [];
  let shootingStars = [];
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

  // Color Palette Constants
  const SKY_TOP = '#040714';
  const SKY_MID = '#081229';
  const SKY_BOTTOM = '#0d1d3d';
  const HORIZON_GLOW = 'rgba(6, 182, 212, 0.08)';

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    initStars();
  }

  function initStars() {
    stars = [];
    const count = Math.floor((width * height) / 3800);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.85),
        radius: Math.random() * 1.3 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        baseAlpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: Math.random() > 0.8 ? '#7dd3fc' : (Math.random() > 0.85 ? '#c084fc' : '#ffffff')
      });
    }
  }

  function addShootingStar() {
    if (shootingStars.length >= 2) return;
    shootingStars.push({
      x: Math.random() * width * 0.8 + width * 0.1,
      y: Math.random() * (height * 0.4),
      length: Math.random() * 80 + 50,
      speed: Math.random() * 8 + 6,
      angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
      alpha: 1,
      decay: Math.random() * 0.015 + 0.01
    });
  }

  function drawSkyGradient() {
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, SKY_TOP);
    grad.addColorStop(0.65, SKY_MID);
    grad.addColorStop(1, SKY_BOTTOM);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Aurora / Horizon Glow
    const horizonGrad = ctx.createRadialGradient(
      width * 0.5 + (mouse.x * 30),
      height * 0.88,
      10,
      width * 0.5,
      height * 0.88,
      width * 0.65
    );
    horizonGrad.addColorStop(0, 'rgba(14, 165, 233, 0.16)');
    horizonGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)');
    horizonGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, 0, width, height);
  }

  function drawStars(time) {
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const brightness = s.baseAlpha + Math.sin(time * s.twinkleSpeed + s.twinkleOffset) * 0.3;
      const currentAlpha = Math.max(0.1, Math.min(1, brightness));

      // Parallax offset
      const px = s.x + (mouse.x * s.radius * 6);
      const py = s.y + (mouse.y * s.radius * 6);

      ctx.beginPath();
      ctx.arc(px, py, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = currentAlpha;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawShootingStars() {
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      const tailX = ss.x - Math.cos(ss.angle) * ss.length;
      const tailY = ss.y - Math.sin(ss.angle) * ss.length;

      const grad = ctx.createLinearGradient(ss.x, ss.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
      grad.addColorStop(0.3, `rgba(56, 189, 248, ${ss.alpha * 0.7})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.alpha -= ss.decay;

      if (ss.alpha <= 0 || ss.x > width + 100 || ss.y > height + 100) {
        shootingStars.splice(i, 1);
      }
    }
  }

  function drawLandscape() {
    // Distant mountain silhouette
    ctx.fillStyle = '#060a17';
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    // Smooth landscape bezier curve
    const h1 = height * 0.88;
    const h2 = height * 0.82;
    const h3 = height * 0.86;
    const h4 = height * 0.80;
    
    ctx.lineTo(0, h1 + (mouse.y * 8));
    ctx.bezierCurveTo(width * 0.25, h2, width * 0.45, h1 + 10, width * 0.65, h4 + (mouse.y * 10));
    ctx.bezierCurveTo(width * 0.8, h2 - 5, width * 0.92, h3, width, h1);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Foreground mountain silhouette with subtle dark border
    ctx.fillStyle = '#03050c';
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(0, height * 0.92);
    ctx.bezierCurveTo(width * 0.3, height * 0.87, width * 0.55, height * 0.94, width * 0.75, height * 0.89);
    ctx.bezierCurveTo(width * 0.88, height * 0.86, width * 0.95, height * 0.92, width, height * 0.91);
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
  }

  let lastShootingStarTime = 0;
  function animate(timestamp) {
    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    ctx.clearRect(0, 0, width, height);

    drawSkyGradient();
    drawStars(timestamp * 0.05);

    // Random shooting stars every ~3.5 - 7 seconds
    if (timestamp - lastShootingStarTime > 3500 + Math.random() * 4000) {
      addShootingStar();
      lastShootingStarTime = timestamp;
    }

    drawShootingStars();
    drawLandscape();

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = (e.clientX / window.innerWidth) - 0.5;
    mouse.targetY = (e.clientY / window.innerHeight) - 0.5;
  });

  resize();
  requestAnimationFrame(animate);
})();
