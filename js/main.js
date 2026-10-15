import fetchHighlightEvents from "../js/highlight-events.js";
import { formatBadgeDate, formatEventRelativeDate } from "../js/utils.js"

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
