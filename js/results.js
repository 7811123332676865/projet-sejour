import { $, escapeHtml, formatDate } from "./utils.js";
import { CATEGORY_LABELS } from "./events.js";
import { CATEGORY_CHOICES } from "./choices.js";
import { registerEvents } from "./modal.js";

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

  registerEvents(events);
  $("#res-list").innerHTML = events.map(createEventRow).join("");
  $("#res-list").hidden = total === 0;
  $("#res-empty").hidden = total > 0;
  $("#widen").hidden = answers.radius >= 50;

  $("#res-pagination").hidden = totalPages <= 1;
  $("#res-page").textContent = `Page ${page} sur ${totalPages}`;
  $("[data-action='page-prev']").disabled = page <= 1;
  $("[data-action='page-next']").disabled = page >= totalPages;
}

export function renderError() {
  $("#res-title").textContent = "Impossible de charger les sorties";
  $("#res-meta").textContent = "Vérifiez votre connexion puis réessayez.";
  $("#res-list").hidden = true;
  $("#res-empty").hidden = true;
  $("#res-pagination").hidden = true;
}
