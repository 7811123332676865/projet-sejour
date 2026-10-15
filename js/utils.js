export function formatBadgeDate(date) {
    // Configurer le formatage pour le jour de la semaine abrégé (ex: sam.) et le mois (ex: oct.)
    const formatter = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'short',
        month: 'short'
    });

    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    const parts = formatter.formatToParts(date);
    const weekday = parts.find(part => part.type === 'weekday').value.replace('.', ''); // Retire le point si présent
    const month = parts.find(part => part.type === 'month').value.replace('.', '');

    // Récupérer le numéro du jour (ex: 17)
    const dayNumber = date.getDate();

    return {
        dayNumber: dayNumber,
        dayName: weekday.toUpperCase(),  // "SAM"
        monthName: month.toUpperCase()  // "OCT"
    };
}

const exempleDate = new Date('2026-10-17');
const badge = formatBadgeDate(exempleDate);
console.log(badge);

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
        // Format classique complet : "samedi 17 octobre"
        const tmpDate = new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        }).format(eventDate);
        return tmpDate + " - " + eventHour;
    }
}
// console.log(formatEventRelativeDate('2026-10-15', '21:00'));