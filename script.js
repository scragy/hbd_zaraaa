let highestZ = 1;
let activePaper = null; // simpan paper yang sedang di-drag
let activeInstance = null; // simpan instance Paper yang sedang aktif

class Paper {
  constructor() {
    this.holdingPaper = false;
    this.startX = 0;
    this.startY = 0;
    this.moveX = 0;
    this.moveY = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.velX = 0;
    this.velY = 0;
    this.rotation = Math.random() * 30 - 15;
    this.currentPaperX = 0;
    this.currentPaperY = 0;
    this.rotating = false;
    this.isMobile = /Mobi|Android/i.test(navigator.userAgent);
  }

  init(paper) {
    if (this.isMobile) {
      // Touch events for mobile
      paper.addEventListener('touchstart', (e) => {
        if(this.holdingPaper) return;
        this.holdingPaper = true;
        paper.style.zIndex = highestZ++;
        this.startX = e.touches[0].clientX;
        this.startY = e.touches[0].clientY;
        this.prevX = this.startX;
        this.prevY = this.startY;
      }, {passive: false});

      paper.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if(!this.rotating) {
          this.moveX = e.touches[0].clientX;
          this.moveY = e.touches[0].clientY;
          this.velX = this.moveX - this.prevX;
          this.velY = this.moveY - this.prevY;
        }
        const dirX = e.touches[0].clientX - this.startX;
        const dirY = e.touches[0].clientY - this.startY;
        const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);
        const dirNormalizedX = dirX / dirLength;
        const dirNormalizedY = dirY / dirLength;
        const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
        let degrees = 180 * angle / Math.PI;
        degrees = (360 + Math.round(degrees)) % 360;
        if(this.rotating) {
          this.rotation = degrees;
        }
        if(this.holdingPaper) {
          if(!this.rotating) {
            this.currentPaperX += this.velX;
            this.currentPaperY += this.velY;
          }
          this.prevX = this.moveX;
          this.prevY = this.moveY;
          paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
        }
      }, {passive: false});

      paper.addEventListener('touchend', () => {
        this.holdingPaper = false;
        this.rotating = false;
      });

      // Optional: gesture events for rotation (not supported on all browsers)
      paper.addEventListener('gesturestart', (e) => {
        e.preventDefault();
        this.rotating = true;
      });
      paper.addEventListener('gestureend', () => {
        this.rotating = false;
      });

    } else {
      // Mouse events untuk desktop
      paper.addEventListener('mousedown', (e) => {
        if (e.button === 0) { // left click
          activePaper = paper;
          activeInstance = this;
          this.holdingPaper = true;
          paper.style.zIndex = highestZ++;
          this.startX = e.clientX;
          this.startY = e.clientY;
          this.prevX = this.startX;
          this.prevY = this.startY;
        } else if (e.button === 2) { // right click
          this.rotating = true;
        }
      });

      paper.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }
}

// Event global untuk mousemove dan mouseup
document.addEventListener('mousemove', (e) => {
  if (activeInstance && activeInstance.holdingPaper) {
    activeInstance.moveX = e.clientX;
    activeInstance.moveY = e.clientY;
    activeInstance.velX = activeInstance.moveX - activeInstance.prevX;
    activeInstance.velY = activeInstance.moveY - activeInstance.prevY;
    if(!activeInstance.rotating) {
      activeInstance.currentPaperX += activeInstance.velX;
      activeInstance.currentPaperY += activeInstance.velY;
    }
    activeInstance.prevX = activeInstance.moveX;
    activeInstance.prevY = activeInstance.moveY;
    activePaper.style.transform = `translateX(${activeInstance.currentPaperX}px) translateY(${activeInstance.currentPaperY}px) rotateZ(${activeInstance.rotation}deg)`;
  }
  // Rotasi dengan klik kanan
  if (activeInstance && activeInstance.rotating && activeInstance.holdingPaper) {
    const dirX = e.clientX - activeInstance.startX;
    const dirY = e.clientY - activeInstance.startY;
    const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);
    const dirNormalizedX = dirX / dirLength;
    const dirNormalizedY = dirY / dirLength;
    const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
    let degrees = 180 * angle / Math.PI;
    degrees = (360 + Math.round(degrees)) % 360;
    activeInstance.rotation = degrees;
    activePaper.style.transform = `translateX(${activeInstance.currentPaperX}px) translateY(${activeInstance.currentPaperY}px) rotateZ(${activeInstance.rotation}deg)`;
  }
});

document.addEventListener('mouseup', (e) => {
  if (activeInstance) {
    activeInstance.holdingPaper = false;
    if (e.button === 2) {
      activeInstance.rotating = false;
    }
    activePaper = null;
    activeInstance = null;
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const papers = Array.from(document.querySelectorAll('.paper'));
  papers.forEach(paper => {
    const p = new Paper();
    p.init(paper);
  });

  // Musik: autoplay trigger untuk beberapa browser
  var music = document.getElementById('bg-music');
  function startMusic() {
    music.play();
    document.removeEventListener('touchstart', startMusic);
    document.removeEventListener('click', startMusic);
  }
  document.addEventListener('touchstart', startMusic);
  document.addEventListener('click', startMusic);
});
