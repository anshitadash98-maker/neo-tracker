// ===================================================
// PART 1: STATIC STARS + OCCASIONAL SHOOTING STARS
// ===================================================
const canvas = document.getElementById("stars-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const STAR_COUNT = 120;
const staticStars = [];

for (let i = 0; i < STAR_COUNT; i++) {
  staticStars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.2 + 0.3,
    alpha: Math.random() * 0.4 + 0.15,
  });
}

let shootingStars = [];

function spawnShootingStar() {
  shootingStars.push({
    x: Math.random() * canvas.width * 0.6,
    y: Math.random() * canvas.height * 0.3,
    length: Math.random() * 120 + 100,
    angle: Math.PI / 5,
    speed: Math.random() * 6 + 8,
    life: 1,
  });
}

function scheduleNextShootingStar() {
  const delay = Math.random() * 5000 + 4000;
  setTimeout(() => {
    spawnShootingStar();
    scheduleNextShootingStar();
  }, delay);
}
scheduleNextShootingStar();

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#e2e8f0";
  for (const star of staticStars) {
    ctx.globalAlpha = star.alpha;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  shootingStars.forEach((s) => {
    const dx = Math.cos(s.angle) * s.length;
    const dy = Math.sin(s.angle) * s.length;

    const gradient = ctx.createLinearGradient(s.x, s.y, s.x - dx, s.y - dy);
    gradient.addColorStop(0, `rgba(226, 232, 240, ${s.life})`);
    gradient.addColorStop(1, "rgba(226, 232, 240, 0)");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - dx, s.y - dy);
    ctx.stroke();

    s.x += Math.cos(s.angle) * s.speed;
    s.y += Math.sin(s.angle) * s.speed;
    s.life -= 0.035;
  });

  shootingStars = shootingStars.filter((s) => s.life > 0);

  requestAnimationFrame(animateStars);
}
animateStars();

// ===================================================
// PART 2: NASA NEO API LOGIC
// ===================================================
const API_KEY = "2zsUwGtVB3WWbEuJax6EKWMuvxxwtjHXknIV5fxV";
const searchBtn = document.getElementById("search-btn");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const cardsGrid = document.getElementById("cards-grid");

searchBtn.addEventListener("click", () => {
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  fetchAsteroids(startDate, endDate);
});

async function fetchAsteroids(startDate, endDate) {
  cardsGrid.innerHTML = `<div class="loader"></div>`;

  const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      cardsGrid.innerHTML = `<p style="color:#e74c3c;">Error: ${data.error_message || "Could not fetch data."}</p>`;
      return;
    }

    renderCards(data.near_earth_objects);
  } catch (error) {
    cardsGrid.innerHTML = `<p style="color:#e74c3c;">Something went wrong. Check your internet or API key.</p>`;
    console.error(error);
  }
}

function renderCards(neoData) {
  cardsGrid.innerHTML = "";

  for (const date in neoData) {
    const asteroidsOnDate = neoData[date];

    for (const asteroid of asteroidsOnDate) {
      const card = createCard(asteroid);
      cardsGrid.appendChild(card);
    }
  }

  if (cardsGrid.innerHTML === "") {
    cardsGrid.innerHTML = `<p style="color:#8b949e;">No asteroids found for this date range.</p>`;
  }
}

function createCard(asteroid) {
  const isHazardous = asteroid.is_potentially_hazardous_asteroid;

  const minDiameter = asteroid.estimated_diameter.meters.estimated_diameter_min.toFixed(1);
  const maxDiameter = asteroid.estimated_diameter.meters.estimated_diameter_max.toFixed(1);

  const missDistanceKm = parseFloat(
    asteroid.close_approach_data[0].miss_distance.kilometers
  );
  const missDistanceMillion = (missDistanceKm / 1_000_000).toFixed(1);

  const card = document.createElement("div");
  card.className = `card ${isHazardous ? "hazardous" : ""}`;

  card.innerHTML = `
    <h3>${asteroid.name}</h3>
    <p>Diameter: ${minDiameter}–${maxDiameter} m</p>
    <p>Miss Distance: ${missDistanceMillion}M km</p>
    <span class="badge ${isHazardous ? "hazardous" : "safe"}">
      ${isHazardous ? "Hazardous" : "Not Hazardous"}
    </span>
  `;

  return card;
}

// ===================================================
// PART 3: SMOOTH SCROLL FOR NAV LINKS
// ===================================================
document.querySelectorAll(".nav-links a").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    const targetEl = document.getElementById(targetId);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth" });
    }
  });
});