import { $ } from "./utils.js";
import * as actions from "./actions.js";
import { searchCities, onPlaceKeydown, selectCity, closeCities } from "./cities.js";

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
