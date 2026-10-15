import { getHighlightEvents } from "../js/highlight-events.js";
import { formatBadgeDate, formatEventRelativeDate } from "../js/utils.js"

const highlightEvents = await getHighlightEvents();

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

    highlightList.appendChild(newEvent);
    newEvent.innerHTML = `
        <p>${formatBadgeDate(eventStartDate).dayName} ${formatBadgeDate(eventStartDate).dayNumber} ${formatBadgeDate(eventStartDate).monthName}</p>
        <p>${eventLabel}</p>
        <p>${eventType}</p>
        <p>${eventStreetAddress} à ${eventAddressLocality}</p>
        <p>Début : ${formatEventRelativeDate(eventStartDate, eventStartTime)}</p>
        <p>Fin : ${formatEventRelativeDate(eventEndDate, eventEndTime)}</p>
    `;
}
