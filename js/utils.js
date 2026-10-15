export const $ = (selector) => document.querySelector(selector);

export function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export const toIsoDate = (date) => date.toLocaleDateString("fr-CA");
