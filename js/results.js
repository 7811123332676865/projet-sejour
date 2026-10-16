import { $ } from "./utils.js";
import { CATEGORY_LABELS } from "./events.js";
import { CATEGORY_CHOICES } from "./choices.js";

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

const formatDate = (isoDate, options) => new Date(`${isoDate}T12:00`).toLocaleDateString("fr-FR", options);

function formatWhen(event) {
  if (event.endDate && event.endDate !== event.startDate) {
    return `jusqu'au ${formatDate(event.endDate, { day: "numeric", month: "long" })}`;
  }

  const day = formatDate(event.startDate, { weekday: "long", day: "numeric", month: "long" });
  return event.startTime ? `${day}, ${event.startTime.replace(":", " h ")}` : day;
}

const formatPlace = (event) => (event.distance === null ? event.town : `${event.town} (à ${event.distance} km)`);

const createEventRow = (event) => `
  <li>
    <article class="wu-ev is-${event.category}">
      <div class="wu-ev-date" aria-hidden="true">
        <span>${formatDate(event.startDate, { weekday: "short" })}</span>
        <b>${formatDate(event.startDate, { day: "numeric" })}</b>
        <span>${formatDate(event.startDate, { month: "short" })}</span>
      </div>
      <div class="wu-ev-body">
        <p class="wu-ev-kicker">${CATEGORY_LABELS[event.category]} (${formatWhen(event)})</p>
        <h3><a class="wu-link" href="#" data-event="${event.id}" aria-haspopup="dialog">${escapeHtml(event.title)}</a></h3>
        <p class="wu-ev-meta">${escapeHtml(formatPlace(event))}</p>
      </div>
    </article>
  </li>`;

export function renderResults({ events, total, page, totalPages }, answers) {
  const categoryNames = CATEGORY_CHOICES
    .filter((choice) => answers.categories.includes(choice.value))
    .map((choice) => choice.label);

  $("#res-title").textContent = `${total || "Aucune"} sortie${total > 1 ? "s" : ""} autour de ${answers.city.nom}`;
  $("#res-meta").textContent = `${categoryNames.join(", ") || "Tout m'intéresse"}, ${answers.radius} km`;

  $("#res-list").innerHTML = events.map(createEventRow).join("");
  $("#res-list").hidden = total === 0;
  $("#res-empty").hidden = total > 0;
  $("#widen").hidden = answers.radius >= 50;

  $("#res-pagination").hidden = totalPages <= 1;
  $("#res-page").textContent = `Page ${page} sur ${totalPages}`;
  $("[data-action='page-prev']").disabled = page <= 1;
  $("[data-action='page-next']").disabled = page >= totalPages;
}

const getDirectionsUrl = (event) => {
  const destination = event.geo ? `${event.geo.lat},${event.geo.lon}` : event.address;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
};

export function renderEventModal(event) {
  $("#modal-body").innerHTML = `
    <div class="wu-modal-top is-${event.category}">
      <button type="button" class="wu-modal-close" data-action="close-modal" aria-label="Fermer">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button>
      <div class="wu-tk-date" aria-hidden="true">
        <b>${formatDate(event.startDate, { day: "numeric" })}</b>
        <span><span>${formatDate(event.startDate, { weekday: "short" })}</span><span>${formatDate(event.startDate, { month: "short" })}</span></span>
      </div>
      <p class="wu-tk-cat">${CATEGORY_LABELS[event.category]}</p>
      <h2 id="modal-title" class="wu-modal-title">${escapeHtml(event.title)}</h2>
    </div>
    <div class="wu-modal-body">
      ${event.description ? `<p class="wu-modal-desc">${escapeHtml(event.description)}</p>` : ""}
      <dl class="wu-modal-info">
        <div><dt>Quand</dt><dd>${formatWhen(event)}</dd></div>
        <div><dt>Où</dt><dd>${escapeHtml(event.address || event.town || "Lieu non précisé")}</dd></div>
        ${event.distance === null ? "" : `<div><dt>Distance</dt><dd>${event.distance} km</dd></div>`}
      </dl>
      <div class="wu-modal-actions">
        <button type="button" class="wu-btn wu-btn-ico" data-action="ics" data-value="${event.id}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
          <span>Ajouter à l'agenda</span>
        </button>
        ${event.geo || event.address ? `
        <a class="wu-next wu-btn-ico" href="${getDirectionsUrl(event)}" target="_blank" rel="noopener">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
          <span>Itinéraire</span>
        </a>` : ""}
      </div>
    </div>`;
}

export function renderError() {
  $("#res-title").textContent = "Impossible de charger les sorties";
  $("#res-meta").textContent = "Vérifiez votre connexion puis réessayez.";
  $("#res-list").hidden = true;
  $("#res-empty").hidden = true;
  $("#res-pagination").hidden = true;
}
