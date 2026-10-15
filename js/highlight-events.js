export async function getHighlightEvents() {
    const api_key = "8bd12b78-f73f-49b1-a8c7-12aecdf7d4fe";
    const url = `https://api.datatourisme.fr/v1/entertainmentAndEvent?department=37`;
    const max_highlighted_events = 5;
    try {
        const response = await fetch(url, {
            headers: {
                "X-API-Key": api_key,
            }
        });
        if (!response.ok) {
            throw new Error(`Statut de réponse : ${response.status}`);
        }

        const results = await response.json();
        const eventList = results.objects;

        if (!eventList || eventList.length === 0) return [];

        if (eventList.length <= max_highlighted_events) {
            return [...eventList];
        }

        // Copie et mélange partiel (algorithme Fisher-Yates)
        const highlightedEventsList = [...eventList];
        for (let i = 0; i < max_highlighted_events; i++) {
            const j = Math.floor(Math.random() * (highlightedEventsList.length - i)) + i;
            [highlightedEventsList[i], highlightedEventsList[j]] = [highlightedEventsList[j], highlightedEventsList[i]];
        }

        return highlightedEventsList.slice(0, max_highlighted_events);

    } catch (error) {
        console.error(error.message);
    }
}
