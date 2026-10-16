import { $, addDays } from "./utils.js";

const formatDay = (days) => addDays(days).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" });

export const WHEN_CHOICES = [
  { value: "today", label: "Aujourd'hui", hint: formatDay(0) },
  { value: "tomorrow", label: "Demain", hint: formatDay(1) },
  { value: "weekend", label: "Ce week-end", hint: "Samedi et dimanche" },
  { value: "date", label: "Une autre date", hint: "Choisir au calendrier" },
  { value: "all", label: "Peu importe", hint: "Toute la semaine", wide: true }
];

export const CATEGORY_CHOICES = [
  { value: "concert", label: "Concerts", hint: "Live, scènes ouvertes" },
  { value: "expo", label: "Expos", hint: "Art, photo, patrimoine" },
  { value: "vide-grenier", label: "Vide-greniers", hint: "Chine et bonnes affaires" },
  { value: "fete", label: "Fêtes locales", hint: "Marchés, fêtes de village" },
  { value: "spectacle", label: "Spectacles", hint: "Théâtre, danse, humour", wide: true }
];

export const RADIUS_CHOICES = [
  { value: "5", label: "5 km", hint: "À deux pas" },
  { value: "10", label: "10 km", hint: "À vélo" },
  { value: "25", label: "25 km", hint: "En voiture" },
  { value: "50", label: "50 km", hint: "Ça vaut le détour" }
];

const ICON_CHECK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

const createChoice = (choice, action, multiple) => `
  <button type="button" class="wu-opt${choice.wide ? " is-wide" : ""}" aria-pressed="false" data-action="${action}" data-value="${choice.value}">
    <span class="wu-opt-txt"><strong>${choice.label}</strong><span>${choice.hint}</span></span>
    <span class="wu-check ${multiple ? "is-multi" : "is-single"}" aria-hidden="true">${multiple ? ICON_CHECK : ""}</span>
  </button>`;

export function renderChoices(containerId, choices, action, multiple = false) {
  $(`#${containerId}`).innerHTML = choices.map((choice) => createChoice(choice, action, multiple)).join("");
}

export function updateChoices(containerId, selectedValues) {
  document.querySelectorAll(`#${containerId} [data-value]`).forEach((button) => {
    button.setAttribute("aria-pressed", String(selectedValues.includes(button.dataset.value)));
  });
}
