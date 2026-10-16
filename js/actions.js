import { $, toIsoDate } from "./utils.js";
import { getSelectedCity, setCity, findCityByPosition } from "./cities.js";
import { nextStep, previousStep, showStep, showScreen } from "./steps.js";
import { WHEN_CHOICES, CATEGORY_CHOICES, RADIUS_CHOICES, renderChoices, updateChoices } from "./choices.js";
import { fetchEvents } from "./events.js";
import { renderResults, renderError } from "./results.js";

const answers = { city: null, when: "", date: "", categories: [], radius: 0 };
let currentPage = 1;

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
    renderResults(await fetchEvents(answers, page), answers);
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
export const openEvent = (id) => console.log("openEvent", id);
export const closeEvent = () => console.log("closeEvent");
export const downloadIcs = (id) => console.log("downloadIcs", id);
