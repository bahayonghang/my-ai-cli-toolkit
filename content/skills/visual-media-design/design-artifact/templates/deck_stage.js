/**
 * Deck Stage - fixed-size HTML slide shell with scaling and navigation.
 * Load with:
 *   <script src="deck_stage.js"></script>
 *
 * Usage:
 *   <deck-stage>
 *     <section>Slide 1</section>
 *     <section>Slide 2</section>
 *   </deck-stage>
 */

class DeckStage extends HTMLElement {
  constructor() {
    super();
    this.currentSlide = 0;
    this.slides = [];
    this.storageKey = "design-artifact-deck-position";
  }

  connectedCallback() {
    this.slides = Array.from(this.querySelectorAll(":scope > section"));
    if (this.slides.length === 0) return;

    const savedIndex = window.localStorage.getItem(this.storageKey);
    if (savedIndex !== null) {
      this.currentSlide = Math.min(parseInt(savedIndex, 10) || 0, this.slides.length - 1);
    }

    this._buildShell();
    this._applySlideState();
    this._scale();
    this._postIndex();

    window.addEventListener("resize", this._scaleBound || (this._scaleBound = () => this._scale()));
    document.addEventListener("keydown", this._onKeyBound || (this._onKeyBound = (event) => this._onKey(event)));
  }

  _buildShell() {
    this.style.width = "100vw";
    this.style.height = "100vh";
    this.style.display = "block";
    this.style.position = "relative";
    this.style.background = "#020617";
    this.style.overflow = "hidden";

    this.canvas = document.createElement("div");
    this.canvas.style.width = "1920px";
    this.canvas.style.height = "1080px";
    this.canvas.style.position = "relative";
    this.canvas.style.transformOrigin = "top left";

    this.slides.forEach((slide, index) => {
      if (!slide.hasAttribute("data-screen-label")) {
        slide.setAttribute("data-screen-label", `${String(index + 1).padStart(2, "0")} Slide`);
      }
      slide.dataset.omValidate = "";
      slide.style.width = "1920px";
      slide.style.height = "1080px";
      slide.style.boxSizing = "border-box";
      this.canvas.appendChild(slide);
    });

    this.appendChild(this.canvas);

    this.counter = document.createElement("div");
    this.counter.style.position = "fixed";
    this.counter.style.left = "50%";
    this.counter.style.bottom = "16px";
    this.counter.style.transform = "translateX(-50%)";
    this.counter.style.padding = "6px 10px";
    this.counter.style.borderRadius = "999px";
    this.counter.style.background = "rgba(15, 23, 42, 0.72)";
    this.counter.style.color = "#e2e8f0";
    this.counter.style.font = "13px/1 system-ui, sans-serif";
    this.counter.style.zIndex = "5";
    this.counter.style.pointerEvents = "none";
    this.appendChild(this.counter);

    this.prevButton = this._makeButton("<", "left");
    this.nextButton = this._makeButton(">", "right");
    this.appendChild(this.prevButton);
    this.appendChild(this.nextButton);
  }

  _makeButton(label, side) {
    const button = document.createElement("button");
    button.textContent = label;
    button.style.position = "fixed";
    button.style.top = "50%";
    button.style[side] = "16px";
    button.style.transform = "translateY(-50%)";
    button.style.width = "44px";
    button.style.height = "44px";
    button.style.borderRadius = "999px";
    button.style.border = "1px solid rgba(255, 255, 255, 0.16)";
    button.style.background = "rgba(15, 23, 42, 0.48)";
    button.style.color = "#ffffff";
    button.style.fontSize = "18px";
    button.style.cursor = "pointer";
    button.style.zIndex = "5";
    button.addEventListener("click", () => this.go(this.currentSlide + (side === "left" ? -1 : 1)));
    return button;
  }

  _applySlideState() {
    this.slides.forEach((slide, index) => {
      slide.style.display = index === this.currentSlide ? "" : "none";
    });
    this.counter.textContent = `${this.currentSlide + 1} / ${this.slides.length}`;
    window.localStorage.setItem(this.storageKey, String(this.currentSlide));
  }

  _scale() {
    if (!this.canvas) return;
    const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    this.canvas.style.transform = `scale(${scale})`;
  }

  _onKey(event) {
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      this.go(this.currentSlide + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      this.go(this.currentSlide - 1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      this.go(0);
    }
    if (event.key === "End") {
      event.preventDefault();
      this.go(this.slides.length - 1);
    }
  }

  go(index) {
    if (index < 0 || index >= this.slides.length || index === this.currentSlide) return;
    this.currentSlide = index;
    this._applySlideState();
    this._postIndex();
  }

  _postIndex() {
    window.postMessage({ slideIndexChanged: this.currentSlide }, "*");
  }
}

customElements.define("deck-stage", DeckStage);

window.addEventListener("beforeprint", () => {
  const stage = document.querySelector("deck-stage");
  if (!stage) return;
  stage.slides.forEach((slide) => {
    slide.style.display = "";
    slide.style.pageBreakAfter = "always";
  });
});

window.addEventListener("afterprint", () => {
  const stage = document.querySelector("deck-stage");
  if (!stage) return;
  stage._applySlideState();
  stage.slides.forEach((slide) => {
    slide.style.pageBreakAfter = "";
  });
});
