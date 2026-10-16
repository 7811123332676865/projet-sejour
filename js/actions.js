import { $, toIsoDate } from "./utils.js";
import { getSelectedCity, setCity, findCityByPosition } from "./cities.js";
import { nextStep, previousStep, showStep, showScreen } from "./steps.js";
import { WHEN_CHOICES, CATEGORY_CHOICES, RADIUS_CHOICES, renderChoices, updateChoices } from "./choices.js";
import { fetchEvents } from "./events.js";
import { renderResults, renderError, renderEventModal } from "./results.js";

const answers = { city: null, when: "", date: "", categories: [], radius: 0 };
let currentPage = 1;
let currentEvents = [];

function showMessage(id, text, type = "err") {
  const message = $(`#${id}`);
  message.textContent = text;
  message.className = `wu-msg is-${type}`;
}

export function initForm() {
  renderChoices("when-opts", WHEN_CHOICES, "when");
  renderChoices("cat-opts", CATEGORY_CHOICES, "cat", true);
  renderChoices("radius-opts", RADIUS_CHOICES, "radius");
  $("#date").min = toIsoDate(new Date());

  selectWhen("weekend");
  selectRadius("5");
}

export function submitWhere() {
  answers.city = getSelectedCity();

  if (!answers.city) {
    $("#place").setAttribute("aria-invalid", "true");
    $("#place").focus();
    return showMessage("place-msg", "Choisissez une ville dans la liste.");
  }

  nextStep();
}

function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
  });
}

function setLocating(isLocating) {
  $("[data-action='locate']").disabled = isLocating;
  $(".js-geo-spin").hidden = !isLocating;
  $(".js-geo-icon").hidden = isLocating;
  $(".js-geo-label").textContent = isLocating ? "Localisation…" : "Utiliser ma position";
}

export async function locate() {
  setLocating(true);
  showMessage("place-msg", "Localisation en cours…", "info");

  try {
    const { coords } = await getPosition();
    const city = await findCityByPosition(coords.latitude, coords.longitude);
    setCity(city);
    showMessage("place-msg", `Position détectée : ${city.nom}`, "ok");
  } catch (error) {
    showMessage("place-msg", error.code === 1
      ? "Accès à votre position refusé. Saisissez votre ville."
      : "Position introuvable. Réessayez ou saisissez votre ville.");
  }

  setLocating(false);
}

export function selectWhen(value) {
  answers.when = value;
  updateChoices("when-opts", [value]);
  showMessage("when-msg", "");
  $("#date-block").hidden = value !== "date";
}

export function changeDate(date) {
  answers.date = date;
  showMessage("date-msg", "");
}

export function whenNext() {
  if (!answers.when) return showMessage("when-msg", "Choisissez une option pour continuer.");
  if (answers.when === "date" && (!answers.date || !$("#date").checkValidity())) {
    return showMessage("date-msg", "Choisissez une date valide à partir d'aujourd'hui pour continuer.");
  }
  nextStep();
}

export function toggleCat(value) {
  answers.categories = answers.categories.includes(value)
    ? answers.categories.filter((category) => category !== value)
    : [...answers.categories, value];

  updateChoices("cat-opts", answers.categories);

  const count = answers.categories.length;
  $("#what-next-label").textContent = count > 0 ? `Suivant (${count})` : "Tout m'intéresse";
}

export function whatNext() {
  $("#radius-from").textContent = answers.city.nom;
  nextStep();
}

export function selectRadius(value) {
  answers.radius = Number(value);
  updateChoices("radius-opts", [value]);
  showMessage("radius-msg", "");
}

export function radiusNext() {
  if (!answers.radius) return showMessage("radius-msg", "Choisissez une distance pour continuer.");
  search();
}

async function search(page = 1) {
  currentPage = page;
  showScreen("loading");

  try {
    const results = await fetchEvents(answers, page);
    currentEvents = results.events;
    renderResults(results, answers);
  } catch (error) {
    console.error(error);
    renderError();
  }

  showScreen("results");
}

export function widen() {
  selectRadius("50");
  search();
}

export const previousPage = () => search(currentPage - 1);
export const nextPage = () => search(currentPage + 1);
export const back = () => previousStep();
export const editWhen = () => showStep(1);
export const refine = () => showStep(0);
export const restart = () => location.reload();

export const scrollTrack = (direction) => console.log("scrollTrack", direction);

const findEvent = (id) => currentEvents.find((event) => event.id === id);

export function openEvent(id) {
  const event = findEvent(id);
  if (!event) return;

  renderEventModal(event);
  $("#ev-modal").showModal();
}

export const closeEvent = () => $("#ev-modal").close();

const escapeIcs = (text) => text.replace(/[\\,;]/g, "\\$&").replace(/\n/g, "\\n");
const toIcsDate = (isoDate) => isoDate.replaceAll("-", "");

function getIcsDates(event) {
  if (event.startTime) {
    const [hours, minutes] = event.startTime.split(":");
    return [`DTSTART:${toIcsDate(event.startDate)}T${hours}${minutes}00`];
  }

  const end = new Date(`${event.endDate || event.startDate}T12:00`);
  end.setDate(end.getDate() + 1);
  return [`DTSTART;VALUE=DATE:${toIcsDate(event.startDate)}`, `DTEND;VALUE=DATE:${toIcsDate(toIsoDate(end))}`];
}

export function downloadIcs(id) {
  const event = findEvent(id);
  if (!event) return;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//What's up ?!//FR",
    "BEGIN:VEVENT",
    `UID:${event.id}@whatsup`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    ...getIcsDates(event),
    `SUMMARY:${escapeIcs(event.title)}`,
    event.description && `DESCRIPTION:${escapeIcs(event.description)}`,
    (event.address || event.town) && `LOCATION:${escapeIcs(event.address || event.town)}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].filter(Boolean);

  const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
