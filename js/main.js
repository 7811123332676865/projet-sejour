import { $ } from "./utils.js";
import * as actions from "./actions.js";
import { searchCities, onPlaceKeydown, selectCity, closeCities } from "./cities.js";
import fetchHighlightEvents from "../js/highlight-events.js";
import { formatBadgeDate, formatEventRelativeDate } from "../js/utils.js"

const placeInput = $("#place");
const modal = $("#ev-modal");

const clickActions = {
  city: selectCity,
  locate: actions.locate,
  back: actions.back,
  when: actions.selectWhen,
  "when-next": actions.whenNext,
  cat: actions.toggleCat,
  "what-next": actions.whatNext,
  radius: actions.selectRadius,
  "radius-next": actions.radiusNext,
  "page-prev": actions.previousPage,
  "page-next": actions.nextPage,
  widen: actions.widen,
  "edit-when": actions.editWhen,
  refine: actions.refine,
  restart: actions.restart,
  prev: () => actions.scrollTrack(-1),
  next: () => actions.scrollTrack(1),
  "close-modal": actions.closeEvent,
  ics: actions.downloadIcs
};

$("#step-where").addEventListener("submit", (event) => {
  event.preventDefault();
  actions.submitWhere();
});

placeInput.addEventListener("input", () => searchCities(placeInput.value));
placeInput.addEventListener("keydown", onPlaceKeydown);
placeInput.addEventListener("blur", closeCities);
$("#city-list").addEventListener("mousedown", (event) => event.preventDefault());
$("#date").addEventListener("change", (event) => actions.changeDate(event.target.value));

modal.addEventListener("click", (event) => {
  if (event.target === modal) actions.closeEvent();
});

document.addEventListener("click", (event) => {
  const eventLink = event.target.closest("[data-event]");
  if (eventLink) {
    event.preventDefault();
    actions.openEvent(eventLink.dataset.event);
    return;
  }

  const button = event.target.closest("[data-action]");
  if (button && clickActions[button.dataset.action]) {
    clickActions[button.dataset.action](button.dataset.value);
  }
});

actions.initForm();

const highlightEvents = await fetchHighlightEvents();

const highlightList = document.querySelector(".highlight-list")
for (let i = 0; i < highlightEvents.length; i++) {

    const newEvent = document.createElement("li");
    const eventLabel = highlightEvents[i]?.label?.['@fr'] ?? "Indéterminé";
    const eventType = highlightEvents[i]?.type?.[0] ?? "Événement";
    const eventStreetAddress = highlightEvents[i]?.isLocatedAt?.[0]?.address?.[0]?.streetAddress?.[0] ?? "Adresse";
    const eventAddressLocality = highlightEvents[i]?.isLocatedAt?.[0]?.address?.[0]?.addressLocality ?? "Localisation";
    const eventStartDate = highlightEvents[i]?.takesPlaceAt?.[0]?.startDate ?? "Date début";
    const eventStartTime = highlightEvents[i]?.takesPlaceAt?.[0]?.startTime ?? "Horaire début";
    const eventEndDate = highlightEvents[i]?.takesPlaceAt?.[0]?.endDate ?? "Date fin";
    const eventEndTime = highlightEvents[i]?.takesPlaceAt?.[0]?.endTime ?? "Horaire fin";

    const badgeDate = formatBadgeDate(eventStartDate);
    const dateP = document.createElement("p");
    dateP.textContent = `${badgeDate.dayName} ${badgeDate.dayNumber} ${badgeDate.monthName}`;
    const labelP = document.createElement("p");
    labelP.textContent = eventLabel;
    const typeP = document.createElement("p");
    typeP.textContent = eventType;
    const addressP = document.createElement("p");
    addressP.textContent = `${eventStreetAddress} à ${eventAddressLocality}`;
    const startP = document.createElement("p");
    startP.textContent = `Début : ${formatEventRelativeDate(eventStartDate, eventStartTime)}`;
    const endP = document.createElement("p");
    endP.textContent = `Fin : ${formatEventRelativeDate(eventEndDate, eventEndTime)}`;

    newEvent.append(dateP, labelP, typeP, addressP, startP, endP);
    highlightList.appendChild(newEvent);
}
