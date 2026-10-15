import { getSelectedCity, setCity, findCityByPosition } from "./cities.js";

export function submitWhere() {
  const placeInput = document.querySelector("#place");
  const city = getSelectedCity();

  if (!city) {
    placeInput.setAttribute("aria-invalid", "true");
    showPlaceMessage("Choisissez une ville dans la liste.", "err");
    placeInput.focus();
    return;
  }

  console.log("submitWhere", city);
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
  console.log("selectWhen", value);
}

export function changeDate(date) {
  console.log("changeDate", date);
}

export function whenNext() {
  console.log("whenNext");
}

export function toggleCat(value) {
  console.log("toggleCat", value);
}

export function whatNext() {
  console.log("whatNext");
}

export function selectRadius(value) {
  console.log("selectRadius", value);
}

export function radiusNext() {
  console.log("radiusNext");
}

export function back() {
  console.log("back");
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
