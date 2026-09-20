const STORAGE_KEY = "biblioteque-emprunts";

const form = document.getElementById("loan-form");
const numeroOrInput = document.getElementById("numero-or");
const nomEleveInput = document.getElementById("nom-eleve");
const titreLivreInput = document.getElementById("titre-livre");
const formMessage = document.getElementById("form-message");
const loansBody = document.getElementById("loans-body");
const emptyMessage = document.getElementById("empty-message");
const searchInput = document.getElementById("search");
const countLabel = document.getElementById("count-label");
const exportBtn = document.getElementById("export-btn");

function loadLoans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLoans(loans) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
}

let loans = loadLoans();

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function render() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = query
    ? loans.filter((loan) =>
        [loan.numeroOr, loan.nomEleve, loan.titreLivre]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
    : loans;

  loansBody.innerHTML = "";

  if (filtered.length === 0) {
    emptyMessage.textContent =
      loans.length === 0
        ? "Aucun emprunt enregistré pour le moment."
        : "Aucun résultat pour cette recherche.";
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
    const sorted = [...filtered].sort((a, b) => b.createdAt - a.createdAt);
    for (const loan of sorted) {
      const tr = document.createElement("tr");

      const tdNumero = document.createElement("td");
      tdNumero.textContent = loan.numeroOr;

      const tdNom = document.createElement("td");
      tdNom.textContent = loan.nomEleve;

      const tdTitre = document.createElement("td");
      tdTitre.textContent = loan.titreLivre;

      const tdDate = document.createElement("td");
      tdDate.textContent = formatDate(loan.createdAt);

      const tdActions = document.createElement("td");
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Supprimer";
      deleteBtn.addEventListener("click", () => removeLoan(loan.id));
      tdActions.appendChild(deleteBtn);

      tr.append(tdNumero, tdNom, tdTitre, tdDate, tdActions);
      loansBody.appendChild(tr);
    }
  }

  countLabel.textContent =
    loans.length === 0
      ? ""
      : `${filtered.length} / ${loans.length} emprunt${loans.length > 1 ? "s" : ""}`;
}

function removeLoan(id) {
  loans = loans.filter((loan) => loan.id !== id);
  saveLoans(loans);
  render();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const numeroOr = numeroOrInput.value.trim();
  const nomEleve = nomEleveInput.value.trim();
  const titreLivre = titreLivreInput.value.trim();

  if (!numeroOr || !nomEleve || !titreLivre) {
    formMessage.textContent = "Merci de remplir les trois champs.";
    return;
  }

  loans.push({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()),
    numeroOr,
    nomEleve,
    titreLivre,
    createdAt: Date.now(),
  });

  saveLoans(loans);
  form.reset();
  numeroOrInput.focus();
  formMessage.textContent = `Emprunt ajouté pour ${nomEleve}.`;
  render();
});

searchInput.addEventListener("input", render);

function toCsvValue(value) {
  const escaped = String(value).replace(/"/g, '""');
  return `"${escaped}"`;
}

exportBtn.addEventListener("click", () => {
  if (loans.length === 0) return;

  const header = ["Numero d'ordre", "Nom de l'eleve", "Titre du livre", "Date"];
  const rows = loans.map((loan) => [
    loan.numeroOr,
    loan.nomEleve,
    loan.titreLivre,
    formatDate(loan.createdAt),
  ]);

  const csv = [header, ...rows].map((row) => row.map(toCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "emprunts-bibliotheque.csv";
  a.click();
  URL.revokeObjectURL(url);
});

render();
