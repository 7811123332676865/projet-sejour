import { getSelectedCity, setCity, findCityByPosition } from "./cities.js";
import { nextStep, previousStep } from "./steps.js";
import { WHEN_CHOICES, CATEGORY_CHOICES, RADIUS_CHOICES, renderChoices, updateChoices } from "./choices.js";

const answers = {
  city: null,
  when: "",
  date: "",
  categories: [],
  radius: 0
};

function showError(id, text) {
  document.querySelector(`#${id}`).textContent = text;
}

export function initForm() {
  renderChoices("when-opts", WHEN_CHOICES, "when");
  renderChoices("cat-opts", CATEGORY_CHOICES, "cat", true);
  renderChoices("radius-opts", RADIUS_CHOICES, "radius");
  document.querySelector("#date").min = new Date().toLocaleDateString("fr-CA");
}

export function submitWhere() {
  const placeInput = document.querySelector("#place");
  const city = getSelectedCity();

  if (!city) {
    placeInput.setAttribute("aria-invalid", "true");
    showPlaceMessage("Choisissez une ville dans la liste.", "err");
    placeInput.focus();
    return;
  }

  answers.city = city;
  nextStep();
}

function getPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
  });
}

function setLocating(isLocating) {
  document.querySelector("[data-action='locate']").disabled = isLocating;
  document.querySelector(".js-geo-spin").hidden = !isLocating;
  document.querySelector(".js-geo-icon").hidden = isLocating;
  document.querySelector(".js-geo-label").textContent = isLocating ? "Localisation…" : "Utiliser ma position";
}

function showPlaceMessage(text, type) {
  const message = document.querySelector("#place-msg");
  message.textContent = text;
  message.className = type ? `wu-msg is-${type}` : "wu-msg";
}

export async function locate() {
  if (!navigator.geolocation) {
    showPlaceMessage("La géolocalisation n'est pas disponible. Saisissez votre ville.", "err");
    return;
  }

  setLocating(true);
  showPlaceMessage("Localisation en cours…");

  try {
    const position = await getPosition();
    const city = await findCityByPosition(position.coords.latitude, position.coords.longitude);
    setCity(city);
    showPlaceMessage(`Position détectée : ${city.nom}`, "ok");
  } catch (error) {
    if (error.code === 1) {
      showPlaceMessage("Accès à votre position refusé. Saisissez votre ville.", "err");
    } else {
      showPlaceMessage("Position introuvable. Réessayez ou saisissez votre ville.", "err");
    }
  }

  setLocating(false);
}

export function selectWhen(value) {
  answers.when = value;
  updateChoices("when-opts", [value]);
  showError("when-msg", "");
  document.querySelector("#date-block").hidden = value !== "date";
}

export function changeDate(date) {
  answers.date = date;
  showError("date-msg", "");
}

export function whenNext() {
  if (!answers.when) {
    showError("when-msg", "Choisissez une option pour continuer.");
    return;
  }

  if (answers.when === "date" && !answers.date) {
    showError("date-msg", "Choisissez une date pour continuer.");
    return;
  }

  nextStep();
}

export function toggleCat(value) {
  if (answers.categories.includes(value)) {
    answers.categories = answers.categories.filter((category) => category !== value);
  } else {
    answers.categories.push(value);
  }

  updateChoices("cat-opts", answers.categories);

  const count = answers.categories.length;
  document.querySelector("#what-next-label").textContent = count > 0 ? `Suivant (${count})` : "Tout m'intéresse";
}

export function whatNext() {
  document.querySelector("#radius-from").textContent = answers.city.nom;
  nextStep();
}

export function selectRadius(value) {
  answers.radius = value;
  updateChoices("radius-opts", [String(value)]);
  showError("radius-msg", "");
}

export function radiusNext() {
  if (!answers.radius) {
    showError("radius-msg", "Choisissez une distance pour continuer.");
    return;
  }

  console.log("Recherche", answers);
}

export function back() {
  previousStep();
}

export function widen() {
  console.log("widen");
}

export function editWhen() {
  console.log("editWhen");
}

export function refine() {
  console.log("refine");
}

export function restart() {
  console.log("restart");
}

export function scrollTrack(direction) {
  console.log("scrollTrack", direction);
}

export function openEvent(id) {
  console.log("openEvent", id);
}

export function closeEvent() {
  console.log("closeEvent");
}

export function downloadIcs(id) {
  console.log("downloadIcs", id);
}
