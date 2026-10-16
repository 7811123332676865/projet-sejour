import { DATATOURISME_API_KEY } from "./config.js";
import { shuffleEvents, highlightEventsNb } from "./utils.js";

export default async function fetchHighlightEvents() {
    const baseUrl = `https://api.datatourisme.fr/v1`
    const params = `/entertainmentAndEvent?department=37&fields=uuid,label,takesPlaceAt,isLocatedAt,type,hasDescription&page_size=100`;
    try {
        const response = await fetch((baseUrl + params), {
            headers: {
                "X-API-Key": DATATOURISME_API_KEY,
            }
        });
        if (!response.ok) {
            throw new Error(`Statut de réponse : ${response.status}`);
        }

        const results = await response.json();
        const eventList = results.objects;

        if (!eventList || eventList.length === 0) return [];

        if (eventList.length <= highlightEventsNb) {
            return [...eventList];
        }

        return shuffleEvents([...eventList]);

    } catch (erreur) {
        console.error(erreur.message);
    }
}