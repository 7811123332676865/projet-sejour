export const $ = (selector) => document.querySelector(selector);

export function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export const toIsoDate = (date) => date.toLocaleDateString("fr-CA");

export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

export const formatDate = (isoDate, options) => new Date(`${isoDate}T12:00`).toLocaleDateString("fr-FR", options);
export const highlightEventsNb = 5 ;

export function formatBadgeDate(date) {
    const formatter = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'short',
        month: 'short'
    });

    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    const parts = formatter.formatToParts(date);
    const weekday = parts.find(part => part.type === 'weekday').value.replace('.', '');
    const month = parts.find(part => part.type === 'month').value.replace('.', '');

    const dayNumber = date.getDate();

    return {
        dayNumber: dayNumber,
        dayName: weekday.toUpperCase(),
        monthName: month.toUpperCase()
    };
}


export function formatEventRelativeDate(eventDate, eventHour) {
    const today = new Date();
    if (!(eventDate instanceof Date)) {
        eventDate = new Date(eventDate);
    }
    const isToday = eventDate.getDate() === today.getDate() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getFullYear() === today.getFullYear();

    if (isToday) {
        return "Aujourd'hui - " + eventHour;
    } else {
        const formattedDate = new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }).format(eventDate);
        return formattedDate + " - " + eventHour;
    }
}

export function shuffleEvents(events) {
    for (let i = 0; i < highlightEventsNb; i++) {
            const j = Math.floor(Math.random() * (events.length - i)) + i;
            [events[i], events[j]] = [events[j], events[i]];
        }

        return events.slice(0, highlightEventsNb);
};