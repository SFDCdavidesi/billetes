const grid = document.getElementById("banknotes-grid");
const noResults = document.getElementById("no-results");
const searchInput = document.getElementById("search");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close-modal");

let allNotes = [];

async function fetchBanknotes(query = "") {
  const url = query
    ? `/api/banknotes?country=${encodeURIComponent(query)}`
    : "/api/banknotes";
  const res = await fetch(url);
  return res.json();
}

function formatDenomination(symbol, denomination) {
  return `${symbol}${denomination.toLocaleString()}`;
}

function renderCards(notes) {
  grid.innerHTML = "";
  if (notes.length === 0) {
    noResults.classList.remove("hidden");
    return;
  }
  noResults.classList.add("hidden");

  notes.forEach((note) => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("role", "listitem");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `${note.denomination} ${note.currency} from ${note.country}`);
    card.innerHTML = `
      <div class="card-banner" style="background:${note.color}"></div>
      <div class="card-body">
        <div class="card-denomination">${formatDenomination(note.symbol, note.denomination)}</div>
        <div class="card-currency">${note.currency}</div>
        <div class="card-country">🌍 ${note.country}</div>
        <div class="card-year">Year: ${note.year}</div>
      </div>
      <div class="card-footer">${note.description}</div>
    `;

    card.addEventListener("click", () => openModal(note));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openModal(note);
    });

    grid.appendChild(card);
  });
}

function openModal(note) {
  document.getElementById("modal-title").textContent =
    `${formatDenomination(note.symbol, note.denomination)} – ${note.currency}`;
  document.getElementById("modal-currency").innerHTML =
    `<strong>Country:</strong> ${note.country}`;
  document.getElementById("modal-denomination").innerHTML =
    `<strong>Denomination:</strong> ${note.symbol}${note.denomination.toLocaleString()}`;
  document.getElementById("modal-year").innerHTML =
    `<strong>Year:</strong> ${note.year}`;
  document.getElementById("modal-description").innerHTML =
    `<strong>About:</strong> ${note.description}`;
  modal.classList.remove("hidden");
  document.getElementById("close-modal").focus();
}

function closeModalFn() {
  modal.classList.add("hidden");
}

closeModal.addEventListener("click", closeModalFn);

modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModalFn();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModalFn();
});

function filterNotes(query) {
  const q = query.toLowerCase();
  return allNotes.filter(
    (n) =>
      n.country.toLowerCase().includes(q) ||
      n.currency.toLowerCase().includes(q)
  );
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();
  renderCards(q ? filterNotes(q) : allNotes);
});

(async () => {
  allNotes = await fetchBanknotes();
  renderCards(allNotes);
})();
