/* ============================================
   particles.js — Hero canvas particle system
   ============================================ */

(function () {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, animFrame;
  const particles = [];
  const COUNT = 130;
  const CONNECT_DIST = 130;

  /* ---- Resize ---- */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---- Particle class ---- */
  class Particle {
    constructor() { this.init(); }

    init() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.38;
      this.vy = (Math.random() - 0.5) * 0.38;
      this.r  = Math.random() * 1.4 + 0.4;
      this.a  = Math.random() * 0.35 + 0.1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      // wrap edges
      if (this.x < -20) this.x = W + 20;
      if (this.x > W + 20) this.x = -20;
      if (this.y < -20) this.y = H + 20;
      if (this.y > H + 20) this.y = -20;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(124,92,252,${this.a})`;
      ctx.fill();
    }
  }

  /* ---- Build pool ---- */
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  /* ---- Gradient orbs (background glow) ---- */
  function drawOrbs() {
    const orbs = [
      { cx: 0.72, cy: 0.28, r: 320, r1: 'rgba(124,92,252,0.13)', r2: 'transparent' },
      { cx: 0.18, cy: 0.72, r: 260, r1: 'rgba(62,207,255,0.08)',  r2: 'transparent' },
      { cx: 0.50, cy: 0.50, r: 400, r1: 'rgba(176,109,255,0.04)', r2: 'transparent' },
    ];
    orbs.forEach(o => {
      const g = ctx.createRadialGradient(o.cx*W, o.cy*H, 0, o.cx*W, o.cy*H, o.r);
      g.addColorStop(0, o.r1);
      g.addColorStop(1, o.r2);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(o.cx*W, o.cy*H, o.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ---- Connection lines ---- */
  function drawConnections() {
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = 0.09 * (1 - dist / CONNECT_DIST);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(62,207,255,${alpha})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ---- Loop ---- */
  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawOrbs();
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    animFrame = requestAnimationFrame(loop);
  }
  loop();

  /* ---- Mouse repel (subtle) ---- */
  let mx = -1000, my = -1000;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
})();
