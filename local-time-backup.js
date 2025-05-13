{
  clockEl: null,
  styleEl: null,
  clockInterval: null,
  isDragging: false,
  offset: { x: 0, y: 0 },

  onLoad() {
    // 1) Inject static, modern CSS
    const style = document.createElement("style");
    style.id = "local-clock-style";
    style.textContent = `
      #local-clock {
        position: fixed;
        bottom: var(--gap, 12px);
        right: var(--gap, 12px);
        padding: 6px 14px;
        font-family: var(--font, "SF Mono"), monospace;
        font-size: 15px;
        font-weight: 500;
        color: var(--text-1, #e0e4fd);
        background: hsla(235, 25%, 15%, 0.6);
        backdrop-filter: blur(8px);
        border: 1px solid var(--accent-3, hsl(210, 85%, 70%));
        border-radius: 8px;
        box-shadow: 0 4px 12px hsla(0, 0%, 0%, 0.3);
        z-index: 9999;
        user-select: none;
        cursor: grab;
      }
      #local-clock.grabbing {
        cursor: grabbing;
      }
    `;
    document.head.appendChild(style);
    this.styleEl = style;

    // 2) Create clock element
    const el = document.createElement("div");
    el.id = "local-clock";
    document.body.appendChild(el);
    this.clockEl = el;

    // 3) Dragging logic (left-button only)
    this._onMouseDown = (e) => {
      if (e.button !== 0) return;
      this.isDragging = true;
      el.classList.add("grabbing");
      const rect = el.getBoundingClientRect();
      this.offset.x = e.clientX - rect.left;
      this.offset.y = e.clientY - rect.top;
      e.preventDefault();
    };

    this._onMouseMove = (e) => {
      if (!this.isDragging) return;
      el.style.left = e.clientX - this.offset.x + "px";
      el.style.top = e.clientY - this.offset.y + "px";
      el.style.bottom = "auto";
      el.style.right = "auto";
    };

    this._onMouseUp = () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      el.classList.remove("grabbing");
    };

    el.addEventListener("mousedown", this._onMouseDown);
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("mouseup", this._onMouseUp);

    // 4) Update time + tooltip
    const update = () => {
      const now = new Date();
      el.textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      el.title = now.toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    };
    update();
    this.clockInterval = setInterval(update, 1000);
  },

  onUnload() {
    clearInterval(this.clockInterval);
    this.clockEl?.removeEventListener("mousedown", this._onMouseDown);
    document.removeEventListener("mousemove", this._onMouseMove);
    document.removeEventListener("mouseup", this._onMouseUp);
    this.clockEl?.remove();
    this.styleEl?.remove();
  }
}
