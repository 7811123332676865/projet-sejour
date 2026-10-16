import { $, escapeHtml, formatDate } from "./utils.js";
import { CATEGORY_LABELS } from "./events.js";

const modal = $("#ev-modal");
const knownEvents = new Map();
let lastTrigger = null;

// Mémorise les événements affichés pour pouvoir les ouvrir via leur id
export const registerEvents = (events) => events.forEach((event) => knownEvents.set(event.id, event));

const formatTime = (time) => time.slice(0, 5).replace(":", " h ");
const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

function formatWhen(event) {
  const longDate = (isoDate) => formatDate(isoDate, { weekday: "long", day: "numeric", month: "long" });

  if (event.endDate && event.endDate !== event.startDate) {
    return `Du ${longDate(event.startDate)} au ${longDate(event.endDate)}`;
  }

  const hours = [event.startTime, event.endTime].filter(Boolean).map(formatTime).join(" – ");
  return capitalize(hours ? `${longDate(event.startDate)}, ${hours}` : longDate(event.startDate));
}

function formatPlace(event) {
  const place = [event.address, event.town].filter(Boolean).join(", ");
  return event.distance === null || event.distance === undefined ? place : `${place} (à ${event.distance} km)`;
}

const mapsUrl = (event) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatPlace({ ...event, distance: null }))}`;

const createModalContent = (event) => `
  <div class="wu-modal-top is-${event.category}">
    <button type="button" class="wu-modal-close" data-action="close-modal" aria-label="Fermer">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
    <div class="wu-tk-date" aria-hidden="true">
      <b>${formatDate(event.startDate, { day: "numeric" })}</b>
      <span>
        <span>${formatDate(event.startDate, { weekday: "short" })}</span>
        <span>${formatDate(event.startDate, { month: "short" })}</span>
      </span>
    </div>
    <p class="wu-tk-cat">${CATEGORY_LABELS[event.category]}</p>
    <h2 id="modal-title" class="wu-modal-title">${escapeHtml(event.title)}</h2>
  </div>
  <div class="wu-modal-body">
    ${event.description ? `<p class="wu-modal-desc">${escapeHtml(event.description)}</p>` : ""}
    <dl class="wu-modal-info">
      <div><dt>Quand</dt><dd>${escapeHtml(formatWhen(event))}</dd></div>
      <div><dt>Où</dt><dd>${escapeHtml(formatPlace(event) || "Lieu non précisé")}</dd></div>
    </dl>
    <div class="wu-modal-actions">
      <button type="button" class="wu-btn wu-btn-ico" data-action="ics" data-value="${event.id}">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
        <span>Ajouter à l'agenda</span>
      </button>
      <a class="wu-next wu-btn-ico" href="${mapsUrl(event)}" target="_blank" rel="noopener">
        <span>Itinéraire</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12h15M13 6l6 6-6 6"/></svg>
      </a>
    </div>
  </div>`;

export function openEvent(id) {
  const event = knownEvents.get(id);
  if (!event) return;

  lastTrigger = document.activeElement;
  $("#modal-body").innerHTML = createModalContent(event);
  modal.showModal();
}

export const closeEvent = () => modal.close();

// Échap ferme aussi le dialog nativement : on rend le focus à la carte d'origine dans tous les cas
modal.addEventListener("close", () => lastTrigger?.focus());

const toIcsDate = (isoDate) => isoDate.replaceAll("-", "");
const toIcsDateTime = (isoDate, time) => `${toIcsDate(isoDate)}T${time.slice(0, 8).replaceAll(":", "").padEnd(6, "0")}`;
const escapeIcs = (text) => text.replace(/[\\,;]/g, (char) => `\\${char}`).replace(/\n/g, "\\n");

function nextDay(isoDate) {
  const date = new Date(`${isoDate}T12:00`);
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString("fr-CA");
}

function getIcsDates(event) {
  const endDate = event.endDate || event.startDate;

  if (!event.startTime) {
    return [`DTSTART;VALUE=DATE:${toIcsDate(event.startDate)}`, `DTEND;VALUE=DATE:${toIcsDate(nextDay(endDate))}`];
  }

  const dates = [`DTSTART:${toIcsDateTime(event.startDate, event.startTime)}`];
  if (event.endTime) dates.push(`DTEND:${toIcsDateTime(endDate, event.endTime)}`);
  return dates;
}

export function downloadIcs(id) {
  const event = knownEvents.get(id);
  if (!event) return;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//What's up ?!//FR",
    "BEGIN:VEVENT",
    `UID:${event.id}@whatsup`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    ...getIcsDates(event),
    `SUMMARY:${escapeIcs(event.title)}`,
    event.description && `DESCRIPTION:${escapeIcs(event.description)}`,
    formatPlace(event) && `LOCATION:${escapeIcs(formatPlace({ ...event, distance: null }))}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean).join("\r\n");

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  link.download = `${event.title.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.ics`;
  link.click();
  URL.revokeObjectURL(link.href);
}
