// Dynamic Lighting & Atmospheric Weather Canvas 2D Engine
export class RenderEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // Lightmap canvas for smooth ambient occlusion and colored point lights
    this.lightCanvas = document.createElement('canvas');
    this.lightCtx = this.lightCanvas.getContext('2d');

    this.lights = [];
    this.weatherType = 'none'; // 'none', 'rain', 'snow', 'magma_embers', 'void_motes'
    this.weatherParticles = [];

    this.dayNightTime = 0; // 0 to 24 hours
    this.enableCRT = false;
    this.enableBloom = true;
  }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
    this.lightCanvas.width = w;
    this.lightCanvas.height = h;
    this.ctx.imageSmoothingEnabled = false;
    this.lightCtx.imageSmoothingEnabled = true; // smooth radial light falloff
    this.initWeatherParticles();
  }

  initWeatherParticles() {
    this.weatherParticles = [];
    for (let i = 0; i < 70; i++) {
      this.weatherParticles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speed: Math.random() * 3 + 2,
        size: Math.random() * 2 + 1,
        angle: Math.PI / 4,
        wobble: Math.random() * Math.PI * 2
      });
    }
  }

  setWeather(type) {
    this.weatherType = type;
  }

  clearLights() {
    this.lights = [];
  }

  addLight(worldX, worldY, radius = 60, color = 'rgba(255, 220, 150, 0.9)', flicker = 0) {
    let finalRadius = radius;
    if (flicker > 0) {
      finalRadius += (Math.random() - 0.5) * flicker;
    }
    this.lights.push({ worldX, worldY, radius: finalRadius, color });
  }

  update(dt) {
    // Day night cycle progression (1 real minute = full cycle or fixed for dungeons)
    this.dayNightTime = (this.dayNightTime + dt * 0.05) % (Math.PI * 2);

    // Weather particle physics
    this.weatherParticles.forEach(p => {
      p.wobble += dt * 3;
      if (this.weatherType === 'rain') {
        p.y += p.speed * 8;
        p.x += p.speed * 2;
      } else if (this.weatherType === 'snow') {
        p.y += p.speed * 1.5;
        p.x += Math.sin(p.wobble) * 1.5;
      } else if (this.weatherType === 'magma_embers') {
        p.y -= p.speed * 1.2; // Float upwards
        p.x += Math.cos(p.wobble) * 1.2;
      } else if (this.weatherType === 'void_motes') {
        p.y += Math.sin(p.wobble) * 1.2;
        p.x += Math.cos(p.wobble) * 1.2;
      }

      // Wrap around screen
      if (p.y > this.canvas.height) p.y = -10;
      if (p.y < -10) p.y = this.canvas.height;
      if (p.x > this.canvas.width) p.x = -10;
      if (p.x < -10) p.x = this.canvas.width;
    });
  }

  // Render dynamic lighting composite layer
  renderLighting(camera, ambientDarkness = 0.55) {
    this.lightCtx.clearRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);

    // 1. Ambient darkness layer
    this.lightCtx.fillStyle = `rgba(10, 12, 22, ${ambientDarkness})`;
    this.lightCtx.fillRect(0, 0, this.lightCanvas.width, this.lightCanvas.height);

    // 2. Cut out radial light cones with 'destination-out' and additive colored glows
    this.lightCtx.globalCompositeOperation = 'destination-out';

    this.lights.forEach(light => {
      const screenPos = camera.worldToScreen(light.worldX, light.worldY);
      const rad = light.radius * camera.zoom;

      const grad = this.lightCtx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, rad
      );
      grad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.7)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      this.lightCtx.fillStyle = grad;
      this.lightCtx.beginPath();
      this.lightCtx.arc(screenPos.x, screenPos.y, rad, 0, Math.PI * 2);
      this.lightCtx.fill();
    });

    this.lightCtx.globalCompositeOperation = 'source-over';

    // 3. Composite lightmap onto main canvas with 'multiply' blend mode
    this.ctx.drawImage(this.lightCanvas, 0, 0);

    // 4. Add subtle soft colored light overlay
    this.lights.forEach(light => {
      const screenPos = camera.worldToScreen(light.worldX, light.worldY);
      const rad = light.radius * camera.zoom;

      const grad = this.ctx.createRadialGradient(
        screenPos.x, screenPos.y, 0,
        screenPos.x, screenPos.y, rad
      );
      grad.addColorStop(0, light.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      this.ctx.save();
      this.ctx.globalCompositeOperation = 'screen';
      this.ctx.globalAlpha = 0.25;
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(screenPos.x, screenPos.y, rad, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  // Render weather particles
  renderWeather() {
    if (this.weatherType === 'none') return;

    this.ctx.save();
    this.weatherParticles.forEach(p => {
      if (this.weatherType === 'rain') {
        this.ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x + 3, p.y + 10);
        this.ctx.stroke();
      } else if (this.weatherType === 'snow') {
        this.ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
        this.ctx.fillRect(p.x, p.y, p.size, p.size);
      } else if (this.weatherType === 'magma_embers') {
        this.ctx.fillStyle = Math.random() > 0.5 ? '#f97316' : '#fef08a';
        this.ctx.fillRect(p.x, p.y, p.size, p.size);
      } else if (this.weatherType === 'void_motes') {
        this.ctx.fillStyle = Math.random() > 0.5 ? '#c084fc' : '#38bdf8';
        this.ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });
    this.ctx.restore();
  }

  // Post-processing effects (CRT Scanlines, Vignette)
  renderPostProcessing() {
    // 1. Soft Vignette
    const grad = this.ctx.createRadialGradient(
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 4,
      this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 1.2
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 2. Retro CRT Scanlines
    if (this.enableCRT) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      for (let y = 0; y < this.canvas.height; y += 3) {
        this.ctx.fillRect(0, y, this.canvas.width, 1.5);
      }
    }
  }
}
