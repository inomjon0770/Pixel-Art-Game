// Desktop Keyboard & Mouse Input Manager
export class InputManager {
  constructor() {
    this.keys = {};
    this.keysPressed = {}; // Single frame triggers
    this.mouse = {
      screenX: 0,
      screenY: 0,
      worldX: 0,
      worldY: 0,
      leftDown: false,
      rightDown: false,
      leftClicked: false,
      rightClicked: false
    };

    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onContextMenu = this.onContextMenu.bind(this);

    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('contextmenu', this.onContextMenu);
  }

  onKeyDown(e) {
    const key = e.key.toLowerCase();
    if (!this.keys[key]) {
      this.keysPressed[key] = true;
    }
    this.keys[key] = true;

    // Prevent scrolling with Space/Arrows
    if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'].includes(key)) {
      e.preventDefault();
    }
  }

  onKeyUp(e) {
    const key = e.key.toLowerCase();
    this.keys[key] = false;
  }

  onMouseMove(e) {
    this.mouse.screenX = e.clientX;
    this.mouse.screenY = e.clientY;
  }

  onMouseDown(e) {
    if (e.button === 0) {
      this.mouse.leftDown = true;
      this.mouse.leftClicked = true;
    } else if (e.button === 2) {
      this.mouse.rightDown = true;
      this.mouse.rightClicked = true;
    }
  }

  onMouseUp(e) {
    if (e.button === 0) this.mouse.leftDown = false;
    if (e.button === 2) this.mouse.rightDown = false;
  }

  onContextMenu(e) {
    e.preventDefault(); // Disable default right-click context menu
  }

  // Update mouse world coordinates using camera
  update(camera) {
    if (camera) {
      const worldPos = camera.screenToWorld(this.mouse.screenX, this.mouse.screenY);
      this.mouse.worldX = worldPos.x;
      this.mouse.worldY = worldPos.y;
    }
  }

  // Flush single-frame trigger events at end of update tick
  flush() {
    this.keysPressed = {};
    this.mouse.leftClicked = false;
    this.mouse.rightClicked = false;
  }

  // Helper query methods
  isDown(key) {
    return !!this.keys[key.toLowerCase()];
  }

  isJustPressed(key) {
    return !!this.keysPressed[key.toLowerCase()];
  }

  getMovementVector() {
    let dx = 0;
    let dy = 0;

    if (this.isDown('w') || this.isDown('arrowup')) dy -= 1;
    if (this.isDown('s') || this.isDown('arrowdown')) dy += 1;
    if (this.isDown('a') || this.isDown('arrowleft')) dx -= 1;
    if (this.isDown('d') || this.isDown('arrowright')) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const len = Math.SQRT2;
      dx /= len;
      dy /= len;
    }

    return { dx, dy };
  }
}

export const input = new InputManager();
