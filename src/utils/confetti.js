export function triggerConfetti() {
  // Prevent duplicate canvases
  if (document.getElementById('ideaos-confetti')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'ideaos-confetti';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '99999';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);

  const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316', '#06b6d4', '#ef4444'];
  const particles = Array.from({ length: 140 }).map(() => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * -150 - 20,
    r: Math.random() * 5 + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx: Math.random() * 4 - 2,
    vy: Math.random() * 5 + 4,
    rot: Math.random() * 360,
    rotSpeed: Math.random() * 6 - 3,
  }));

  const startTime = Date.now();
  function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    let active = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      if (p.y < window.innerHeight) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
      }
    });

    if (active && Date.now() - startTime < 3500) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(animate);
}
