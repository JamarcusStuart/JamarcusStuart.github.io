
// ==========================================
// 256 HOME LAB - SITE FUNCTIONS
// ==========================================

// Page navigation
const navButtons = [...document.querySelectorAll(".nav")];

function showPage(name) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === `page-${name}`);
  });

  navButtons.forEach(button => {
    button.classList.toggle("active", button.dataset.page === name);
  });
}

navButtons.forEach(button => {
  button.addEventListener("click", () => showPage(button.dataset.page));
});

document.querySelectorAll("[data-page-link]").forEach(link => {
  link.addEventListener("click", event => {
    event.preventDefault();
    showPage(link.dataset.pageLink);
  });
});

// Clock and date
const clock = document.getElementById("clock");
const today = document.getElementById("today");

function tick() {
  const date = new Date();

  clock.textContent = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  today.textContent = date.toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }).toUpperCase();
}

tick();
setInterval(tick, 1000);

// Service search
document.getElementById("search").addEventListener("input", event => {
  const query = event.target.value.trim().toLowerCase();

  document.querySelectorAll(".service-card").forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(query)
      ? "flex"
      : "none";
  });
});
