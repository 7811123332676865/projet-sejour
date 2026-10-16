import { $ } from "./utils.js";

const STEPS = ["where", "when", "what", "radius"];
const SCREENS = [...STEPS, "loading", "results"];

let currentIndex = 0;

export function showScreen(name) {
  SCREENS.forEach((screen) => {
    $(`#step-${screen}`).hidden = screen !== name;
  });

  $("#progress").hidden = !STEPS.includes(name);
  if (name === "results") $("#res-title").focus();
}

export function showStep(index) {
  currentIndex = index;
  showScreen(STEPS[index]);

  $("#step-num").textContent = index + 1;
  document.querySelectorAll(".wu-bar").forEach((bar, i) => bar.classList.toggle("is-on", i <= index));
  $(`#q-${STEPS[index]}`).focus();
}

export const nextStep = () => showStep(Math.min(currentIndex + 1, STEPS.length - 1));
export const previousStep = () => showStep(Math.max(currentIndex - 1, 0));
