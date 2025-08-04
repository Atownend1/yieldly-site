// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Simple mobile nav toggle (shown only on small screens)
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
const cta = document.querySelector('.nav-cta');
toggle?.addEventListener('click', () => {
  const open = links.style.display === 'flex';
  links.style.display = open ? 'none' : 'flex';
  cta.style.display = open ? 'none' : 'flex';
});

// Animated light rays on canvas
const c = document.getElementById('lightRays');
const ctx = c.getContext('2d', { alpha: true });

function resize() {
  c.width = c.clientWidth;
  c.height = c.clientHeight;
}
window.addEventListener('resize', resize);
resize();

let t = 0;
function draw() {
  t += 0.005;
  ctx.clearRect(0,0,c.width,c.height);

  // background glow
  const g = ctx.createRadialGradient(c.width*0.8, c.height*0.0, 50, c.width*0.8, c.height*0.0, c.width*0.9);
  g.addColorStop(0, 'rgba(180,160,255,0.25)');
  g.addColorStop(1, 'rgba(180,160,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,c.width,c.height);

  // rays
  const rays = 6;
  for (let i=0;i<rays;i++){
    const base = (-0.6 + i*0.08);
    const angle = base + Math.sin(t + i)*0.01;
    const x0 = c.width*0.75;
    const y0 = -c.height*0.1;
    const len = c.height*1.4;
    ctx.save();
    ctx.translate(x0, y0);
    ctx.rotate(angle);
    const w = c.width*0.02 + Math.sin(t*2+i)*2;
    const grad = ctx.createLinearGradient(0,0,0,len);
    grad.addColorStop(0, 'rgba(255,255,255,0.18)');
    grad.addColorStop(0.3,'rgba(200,200,255,0.08)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-w,0);
    ctx.lineTo(w,0);
    ctx.lineTo(w*4,len);
    ctx.lineTo(-w*4,len);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  requestAnimationFrame(draw);
}
draw();
