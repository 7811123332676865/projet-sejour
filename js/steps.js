const STEPS = ["where", "when", "what", "radius"];

let currentIndex = 0;

export function showStep(index) {
  currentIndex = index;

  STEPS.forEach((step, i) => {
    document.querySelector(`#step-${step}`).hidden = i !== index;
  });

  document.querySelector("#step-num").textContent = index + 1;

  document.querySelectorAll(".wu-bar").forEach((bar, i) => {
    bar.classList.toggle("is-on", i <= index);
  });

  document.querySelector(`#q-${STEPS[index]}`).focus();
}

export function nextStep() {
  if (currentIndex < STEPS.length - 1) {
    showStep(currentIndex + 1);
  }
}

export function previousStep() {
  if (currentIndex > 0) {
    showStep(currentIndex - 1);
  }
}
