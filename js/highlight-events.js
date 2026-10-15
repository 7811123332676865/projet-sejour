export async function getHighlightEvents() {
    const api_key = "8bd12b78-f73f-49b1-a8c7-12aecdf7d4fe";
    const url = `https://api.datatourisme.fr/v1/entertainmentAndEvent?department=37&fields=uuid,label,takesPlaceAt,isLocatedAt,type&page_size=100`;
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

        if (eventList.length <= 3) {
            return [...eventList];
        }

        // Copie et mélange partiel (algorithme Fisher-Yates)
        const shuffledEvents = [...eventList];
        for (let i = 0; i < 3; i++) {
            const j = Math.floor(Math.random() * (shuffledEvents.length - i)) + i;
            [shuffledEvents[i], shuffledEvents[j]] = [shuffledEvents[j], shuffledEvents[i]];
        }

        return shuffledEvents.slice(0, 3);

    } catch (erreur) {
        console.error(erreur.message);
    }
}