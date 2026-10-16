import { $ } from "./utils.js";

const API_URL = "https://geo.api.gouv.fr/communes";
const FIELDS = "fields=nom,codesPostaux,departement,centre";
const ICON_PIN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

const placeInput = $("#place");
const cityList = $("#city-list");

let cities = [];
let activeIndex = -1;
let selectedCity = null;
let searchTimer;

export const getSelectedCity = () => selectedCity;

function toggleCities(isOpen) {
  cityList.hidden = !isOpen;
  placeInput.setAttribute("aria-expanded", String(isOpen));
  placeInput.removeAttribute("aria-activedescendant");
  activeIndex = -1;
}

export const closeCities = () => toggleCities(false);

const createOption = (city, index) => `
  <li id="city-${index}" class="wu-combo-option" role="option" aria-selected="false" data-action="city" data-value="${index}">
    <span class="wu-combo-icon">${ICON_PIN}</span>
    <span class="wu-combo-text"><strong>${city.nom}</strong><span>${city.departement.nom} (${city.codesPostaux[0]})</span></span>
  </li>`;

function renderCities() {
  cityList.innerHTML = cities.length > 0
    ? cities.map(createOption).join("")
    : '<li class="wu-combo-option is-empty" role="option" aria-disabled="true">Aucune ville trouvée</li>';
  toggleCities(true);
}

async function fetchCities(query) {
  const param = /^\d{5}$/.test(query) ? "codePostal" : "nom";

  try {
    const response = await fetch(`${API_URL}?${param}=${encodeURIComponent(query)}&${FIELDS}&boost=population&limit=6`);
    const result = await response.json();
    if (placeInput.value.trim() !== query || document.activeElement !== placeInput) return;

    cities = result.filter((city) => city.departement && city.codesPostaux.length > 0);
    renderCities();
  } catch (error) {
    closeCities();
  }
}

export function searchCities(text) {
  const query = text.trim();
  selectedCity = null;
  clearTimeout(searchTimer);

  if (query.length < 2 || /^\d{1,4}$/.test(query)) {
    cities = [];
    return closeCities();
  }

  searchTimer = setTimeout(() => fetchCities(query), 250);
}

export function setCity(city) {
  selectedCity = city;
  placeInput.value = `${city.nom}, ${city.departement.nom} (${city.codesPostaux[0]})`;
  placeInput.setAttribute("aria-invalid", "false");
  $("#place-msg").textContent = "";
  cities = [];
  closeCities();
}

export const selectCity = (index) => setCity(cities[index]);

export async function findCityByPosition(latitude, longitude) {
  const response = await fetch(`${API_URL}?lat=${latitude}&lon=${longitude}&${FIELDS}`);
  const [city] = await response.json();
  if (!city) throw new Error("Aucune commune à cette position");
  return city;
}

function setActive(index) {
  activeIndex = index;
  [...cityList.children].forEach((option, i) => option.setAttribute("aria-selected", String(i === index)));
  placeInput.setAttribute("aria-activedescendant", `city-${index}`);
  cityList.children[index].scrollIntoView({ block: "nearest" });
}

export function onPlaceKeydown(event) {
  if (cityList.hidden || cities.length === 0) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    setActive(activeIndex === cities.length - 1 ? 0 : activeIndex + 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    setActive(activeIndex <= 0 ? cities.length - 1 : activeIndex - 1);
  } else if (event.key === "Enter" && activeIndex >= 0) {
    event.preventDefault();
    selectCity(activeIndex);
  } else if (event.key === "Escape") {
    closeCities();
  }
}
