import { $ } from "./utils.js";
import * as actions from "./actions.js";
import { searchCities, onPlaceKeydown, selectCity, closeCities } from "./cities.js";
import fetchHighlightEvents from "../js/highlight-events.js";
import { formatBadgeDate, formatEventRelativeDate } from "../js/utils.js"
import { getCategory } from "./events.js";
import { registerEvents } from "./modal.js";

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

$("#feat-track").addEventListener("scroll", actions.updateTrackNav, { passive: true });
addEventListener("resize", actions.updateTrackNav);

const highlightEvents = await fetchHighlightEvents();

const highlightList = document.querySelector(".wu-track")
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

    const startDateBadge = formatBadgeDate(eventStartDate);
    const dateParagraph = document.createElement("p");
    dateParagraph.textContent = `${startDateBadge.dayName} ${startDateBadge.dayNumber} ${startDateBadge.monthName}`;
    const labelParagraph = document.createElement("p");
    const labelLink = document.createElement("a");
    labelLink.className = "wu-link";
    labelLink.href = "#";
    labelLink.dataset.event = highlightEvents[i].uuid;
    labelLink.setAttribute("aria-haspopup", "dialog");
    labelLink.textContent = eventLabel;
    labelParagraph.append(labelLink);
    const typeParagraph = document.createElement("p");
    typeParagraph.textContent = eventType;
    const addressParagraph = document.createElement("p");
    addressParagraph.textContent = `${eventStreetAddress} à ${eventAddressLocality}`;
    const startParagraph = document.createElement("p");
    startParagraph.textContent = `Début : ${formatEventRelativeDate(eventStartDate, eventStartTime)}`;
    const endParagraph = document.createElement("p");
    endParagraph.textContent = `Fin : ${formatEventRelativeDate(eventEndDate, eventEndTime)}`;

    newEvent.append(dateParagraph, labelParagraph, typeParagraph, addressParagraph, startParagraph, endParagraph);
    highlightList.appendChild(newEvent);

    const eventDate = highlightEvents[i]?.takesPlaceAt?.[0] ?? {};
    const eventAddress = highlightEvents[i]?.isLocatedAt?.[0]?.address?.[0] ?? {};
    registerEvents([{
        id: highlightEvents[i].uuid,
        title: eventLabel,
        category: getCategory(highlightEvents[i]?.type ?? [], []),
        description: highlightEvents[i]?.hasDescription?.[0]?.shortDescription?.["@fr"] ?? "",
        startDate: eventDate.startDate,
        endDate: eventDate.endDate,
        startTime: eventDate.startTime ?? "",
        endTime: eventDate.endTime ?? "",
        address: eventAddress.streetAddress?.[0] ?? "",
        town: eventAddress.addressLocality ?? "",
        distance: null
    }]);
}

actions.updateTrackNav();
