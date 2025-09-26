const gameContainer = document.getElementById('gameContainer');
const basket = document.getElementById('basket');
const scoreBoard = document.getElementById('scoreBoard');
const gameOverEl = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');

let score = 0;
let basketX = window.innerWidth / 2 - basket.offsetWidth / 2;
let basketWidth = basket.offsetWidth;
let gameWidth = window.innerWidth;
let gameHeight = window.innerHeight;
let items = [];
let gameRunning = true;

// Set basket initial position
function setBasketPosition(x) {
  if (x < 0) x = 0;
  if (x > gameWidth - basketWidth) x = gameWidth - basketWidth;
  basket.style.left = x + 'px';
  basketX = x;
}

setBasketPosition(basketX);

// Handle basket drag for touch
let dragging = false;
let dragStartX = 0;
let basketStartX = 0;

basket.addEventListener('touchstart', (e) => {
  dragging = true;
  dragStartX = e.touches[0].clientX;
  basketStartX = basketX;
});

basket.addEventListener('touchmove', (e) => {
  if (!dragging) return;
  const touchX = e.touches[0].clientX;
  const dx = touchX - dragStartX;
  setBasketPosition(basketStartX + dx);
});

basket.addEventListener('touchend', () => {
  dragging = false;
});

// Also support arrow keys on desktop
window.addEventListener('keydown', (e) => {
  if (!gameRunning) return;
  if (e.key === 'ArrowLeft') {
    setBasketPosition(basketX - 20);
  } else if (e.key === 'ArrowRight') {
    setBasketPosition(basketX + 20);
  }
});

// Create falling item
function createFallingItem() {
  if (!gameRunning) return;

  const item = document.createElement('div');
  item.classList.add('fallingItem');

  // Random horizontal position
  const x = Math.random() * (gameWidth - 40);
  item.style.left = x + 'px';

  gameContainer.appendChild(item);

  const speed = 2 + Math.random() * 3; // Falling speed

  items.push({el: item, x: x, y: -40, speed: speed});
}

// Check collision between basket and item
function isColliding(item) {
  const basketRect = basket.getBoundingClientRect();
  const itemRect = item.el.getBoundingClientRect();

  return !(
    basketRect.right < itemRect.left ||
    basketRect.left > itemRect.right ||
    basketRect.bottom < itemRect.top ||
    basketRect.top > itemRect.bottom
  );
}

// Game loop
function gameLoop() {
  if (!gameRunning) return;

  for (let i = items.length -1; i >= 0; i--) {
    const item = items[i];
    item.y += item.speed;
    item.el.style.top = item.y + 'px';

    if (isColliding(item)) {
      // Remove item and increase score
      gameContainer.removeChild(item.el);
      items.splice(i,1);
      score++;
      scoreBoard.textContent = 'Score: ' + score;
    } else if (item.y > gameHeight) {
      // Missed item - game over
      endGame();
      return;
    }
  }

  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameRunning = false;
  gameOverEl.style.display = 'block';
}

// Spawn items every 800ms
let spawnInterval = setInterval(() => {
  if (gameRunning) createFallingItem();
}, 800);

restartBtn.addEventListener('click', () => {
  // Reset game state
  score = 0;
  scoreBoard.textContent = 'Score: 0';
  gameOverEl.style.display = 'none';

  // Remove existing items
  items.forEach(item => {
    if(item.el.parentNode) item.el.parentNode.removeChild(item.el);
  });
  items = [];

  gameRunning = true;
  gameLoop();
});

// Start game loop
gameLoop();

// Handle resize to update boundaries
window.addEventListener('resize', () => {
  gameWidth = window.innerWidth;
  gameHeight = window.innerHeight;
  basketWidth = basket.offsetWidth;
  setBasketPosition(basketX); // Adjust basket if outside boundary
});