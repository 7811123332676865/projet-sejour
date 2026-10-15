import {
  submitWhere,
  locate,
  selectWhen,
  changeDate,
  whenNext,
  toggleCat,
  whatNext,
  selectRadius,
  radiusNext,
  back,
  widen,
  editWhen,
  refine,
  restart,
  scrollTrack,
  openEvent,
  closeEvent,
  downloadIcs
} from "./actions.js";
import { searchCities, onPlaceKeydown, selectCity, closeCities } from "./cities.js";

const formWhere = document.querySelector("#step-where");
const placeInput = document.querySelector("#place");
const cityList = document.querySelector("#city-list");
const dateInput = document.querySelector("#date");
const modal = document.querySelector("#ev-modal");

formWhere.addEventListener("submit", (event) => {
  event.preventDefault();
  submitWhere();
});

placeInput.addEventListener("input", () => {
  searchCities(placeInput.value);
});

placeInput.addEventListener("keydown", (event) => {
  onPlaceKeydown(event);
});

placeInput.addEventListener("blur", () => {
  closeCities();
});

cityList.addEventListener("mousedown", (event) => {
  event.preventDefault();
});

dateInput.addEventListener("change", () => {
  changeDate(dateInput.value);
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeEvent();
  }
});

document.addEventListener("click", (event) => {
  const eventLink = event.target.closest("[data-event]");
  if (eventLink) {
    event.preventDefault();
    openEvent(Number(eventLink.dataset.event));
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button) {
    return;
  }

  const value = button.dataset.value;

  switch (button.dataset.action) {
    case "city":
      selectCity(Number(value));
      break;
    case "locate":
      locate();
      break;
    case "back":
      back();
      break;
    case "when":
      selectWhen(value);
      break;
    case "when-next":
      whenNext();
      break;
    case "cat":
      toggleCat(value);
      break;
    case "what-next":
      whatNext();
      break;
    case "radius":
      selectRadius(Number(value));
      break;
    case "radius-next":
      radiusNext();
      break;
    case "widen":
      widen();
      break;
    case "edit-when":
      editWhen();
      break;
    case "refine":
      refine();
      break;
    case "restart":
      restart();
      break;
    case "prev":
      scrollTrack(-1);
      break;
    case "next":
      scrollTrack(1);
      break;
    case "close-modal":
      closeEvent();
      break;
    case "ics":
      downloadIcs(Number(value));
      break;
  }
});
