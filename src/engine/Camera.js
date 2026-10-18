// Smooth Camera tracking with screen shake & viewport culling
export class Camera {
  constructor(viewportWidth = 800, viewportHeight = 600) {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.width = viewportWidth;
    this.height = viewportHeight;
    this.zoom = 2.0; // 2x retro pixel magnification

    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;

    this.bounds = null; // { minX, minY, maxX, maxY }
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
  }

  setBounds(minX, minY, maxX, maxY) {
    this.bounds = { minX, minY, maxX, maxY };
  }

  shake(intensity = 6, duration = 0.25) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  update(targetX, targetY, dt) {
    this.targetX = targetX;
    this.targetY = targetY;

    // Camera center point in world coordinates
    const desiredX = this.targetX - (this.width / (2 * this.zoom));
    const desiredY = this.targetY - (this.height / (2 * this.zoom));

    // Smooth Lerp tracking
    const lerpSpeed = 10;
    this.x += (desiredX - this.x) * Math.min(1, lerpSpeed * dt);
    this.y += (desiredY - this.y) * Math.min(1, lerpSpeed * dt);

    // Screen Shake update
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      this.shakeOffsetX = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.shakeOffsetY = (Math.random() - 0.5) * 2 * this.shakeIntensity;
      this.shakeIntensity *= 0.9;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // Clamp to bounds if present
    if (this.bounds) {
      const viewW = this.width / this.zoom;
      const viewH = this.height / this.zoom;
      this.x = Math.max(this.bounds.minX, Math.min(this.bounds.maxX - viewW, this.x));
      this.y = Math.max(this.bounds.minY, Math.min(this.bounds.maxY - viewH, this.y));
    }
  }

  // Convert screen coordinates to world coordinates
  screenToWorld(screenX, screenY) {
    return {
      x: this.x + (screenX / this.zoom) - (this.shakeOffsetX / this.zoom),
      y: this.y + (screenY / this.zoom) - (this.shakeOffsetY / this.zoom)
    };
  }

  // Convert world coordinates to screen coordinates
  worldToScreen(worldX, worldY) {
    return {
      x: (worldX - this.x) * this.zoom + this.shakeOffsetX,
      y: (worldY - this.y) * this.zoom + this.shakeOffsetY
    };
  }

  // Check if bounding box is visible inside camera view
  isVisible(x, y, w = 32, h = 32) {
    const viewW = this.width / this.zoom;
    const viewH = this.height / this.zoom;
    return (
      x + w >= this.x &&
      x <= this.x + viewW &&
      y + h >= this.y &&
      y <= this.y + viewH
    );
  }
}
