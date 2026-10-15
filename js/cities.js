const placeInput = document.querySelector("#place");
const cityList = document.querySelector("#city-list");

let cities = [];
let activeIndex = -1;
let selectedCity = null;
let searchTimer;

const ICON_PIN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

export function getSelectedCity() {
  return selectedCity;
}

function formatCity(city) {
  return `${city.nom}, ${city.departement.nom} (${city.codesPostaux[0]})`;
}

function openCities() {
  cityList.hidden = false;
  placeInput.setAttribute("aria-expanded", "true");
}

export function closeCities() {
  cityList.hidden = true;
  placeInput.setAttribute("aria-expanded", "false");
  placeInput.removeAttribute("aria-activedescendant");
  activeIndex = -1;
}

function createOption(city, index) {
  const option = document.createElement("li");
  option.id = `city-${index}`;
  option.className = "wu-combo-option";
  option.setAttribute("role", "option");
  option.setAttribute("aria-selected", "false");
  option.dataset.action = "city";
  option.dataset.value = index;

  const icon = document.createElement("span");
  icon.className = "wu-combo-icon";
  icon.innerHTML = ICON_PIN;

  const text = document.createElement("span");
  text.className = "wu-combo-text";

  const name = document.createElement("strong");
  name.textContent = city.nom;

  const details = document.createElement("span");
  details.textContent = `${city.departement.nom} (${city.codesPostaux[0]})`;

  text.append(name, details);
  option.append(icon, text);
  return option;
}

function createEmptyOption() {
  const option = document.createElement("li");
  option.className = "wu-combo-option is-empty";
  option.setAttribute("role", "option");
  option.setAttribute("aria-disabled", "true");
  option.textContent = "Aucune ville trouvée";
  return option;
}

function renderCities() {
  cityList.innerHTML = "";
  activeIndex = -1;

  if (cities.length === 0) {
    cityList.append(createEmptyOption());
  } else {
    cities.forEach((city, index) => cityList.append(createOption(city, index)));
  }

  openCities();
}

async function fetchCities(query) {
  const param = /^\d{5}$/.test(query) ? "codePostal" : "nom";
  const url = `https://geo.api.gouv.fr/communes?${param}=${encodeURIComponent(query)}&fields=nom,codesPostaux,departement&boost=population&limit=6`;

  try {
    const response = await fetch(url);
    const result = await response.json();

    if (placeInput.value.trim() !== query) {
      return;
    }

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
    closeCities();
    return;
  }

  searchTimer = setTimeout(() => fetchCities(query), 250);
}

function setActive(index) {
  activeIndex = index;

  [...cityList.children].forEach((option, i) => {
    option.setAttribute("aria-selected", String(i === index));
  });

  placeInput.setAttribute("aria-activedescendant", `city-${index}`);
  cityList.children[index].scrollIntoView({ block: "nearest" });
}

export function setCity(city) {
  selectedCity = city;
  placeInput.value = formatCity(city);
  placeInput.setAttribute("aria-invalid", "false");
  document.querySelector("#place-msg").textContent = "";
  cities = [];
  closeCities();
}

export function selectCity(index) {
  setCity(cities[index]);
}

export async function findCityByPosition(latitude, longitude) {
  const url = `https://geo.api.gouv.fr/communes?lat=${latitude}&lon=${longitude}&fields=nom,codesPostaux,departement`;
  const response = await fetch(url);
  const result = await response.json();

  if (result.length === 0) {
    throw new Error("Aucune commune à cette position");
  }

  return result[0];
}

export function onPlaceKeydown(event) {
  if (cityList.hidden || cities.length === 0) {
    return;
  }

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
