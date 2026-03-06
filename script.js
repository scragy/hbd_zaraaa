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
    this.scale = 1; // Untuk zoom
    this.previousDistance = 0; // Untuk mendeteksi pinch
    this.previousAngle = 0; // Untuk mendeteksi rotasi dua jari
  }

  // Hitung jarak antar dua jari untuk pinch zoom
  getDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Hitung sudut rotasi dari dua jari
  getRotationAngle(touches) {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  }

  // Update transform dengan rotation dan scale
  updateTransform(paper) {
    paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg) scale(${this.scale})`;
  }

  init(paper) {
    if (this.isMobile) {
      // Touch events for mobile
      paper.addEventListener('touchstart', (e) => {
        // Deteksi 2 jari dulu, baru check holdingPaper
        if(e.touches.length === 2) {
          this.holdingPaper = true;
          this.previousDistance = this.getDistance(e.touches);
          this.previousAngle = this.getRotationAngle(e.touches);
          this.rotating = true;  // ← SET 2-JARI MODE!
          return;
        }
        
        // Jika hanya 1 jari dan sudah holding, skip
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
        
        // Zoom dan rotate dengan dua jari (keduanya bisa terjadi)
        if(e.touches.length === 2 && this.rotating) {
          // Handle zoom (pinch)
          const currentDistance = this.getDistance(e.touches);
          const distanceDelta = Math.abs(currentDistance - this.previousDistance);
          if (distanceDelta > 0.1) { // Threshold untuk detect zoom
            const scaleChange = currentDistance / this.previousDistance;
            this.scale = Math.max(0.5, Math.min(3, this.scale * scaleChange));
            this.previousDistance = currentDistance;
          }
          
          // Handle rotate
          const currentAngle = this.getRotationAngle(e.touches);
          const angleDiff = currentAngle - this.previousAngle;
          if (Math.abs(angleDiff) > 0.3) { // Threshold untuk detect rotation
            this.rotation += angleDiff;
            this.previousAngle = currentAngle;
          }
          
          this.updateTransform(paper);
        } 
        // Dragging dengan satu jari
        else if(e.touches.length === 1 && !this.rotating) {
          this.moveX = e.touches[0].clientX;
          this.moveY = e.touches[0].clientY;
          this.velX = this.moveX - this.prevX;
          this.velY = this.moveY - this.prevY;
          
          if(this.holdingPaper) {
            this.currentPaperX += this.velX;
            this.currentPaperY += this.velY;
            this.prevX = this.moveX;
            this.prevY = this.moveY;
            this.updateTransform(paper);
          }
        }
      }, {passive: false});

      paper.addEventListener('touchend', () => {
        this.holdingPaper = false;
        this.rotating = false;
        this.previousDistance = 0;
        this.previousAngle = 0;
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
          activePaper = paper;
          activeInstance = this;
          this.rotating = true;
          this.startX = e.clientX;
          this.startY = e.clientY;
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
    activePaper.style.transform = `translateX(${activeInstance.currentPaperX}px) translateY(${activeInstance.currentPaperY}px) rotateZ(${activeInstance.rotation}deg) scale(${activeInstance.scale})`;
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
    activePaper.style.transform = `translateX(${activeInstance.currentPaperX}px) translateY(${activeInstance.currentPaperY}px) rotateZ(${activeInstance.rotation}deg) scale(${activeInstance.scale})`;
  }
});

document.addEventListener('mouseup', (e) => {
  if (activeInstance) {
    activeInstance.holdingPaper = false;
    activeInstance.rotating = false; // Reset rotating flag saat mouse release
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
