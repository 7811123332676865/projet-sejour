export async function getHighlightEvents() {
  const api_key = "8bd12b78-f73f-49b1-a8c7-12aecdf7d4fe";  
  const url = `https://api.datatourisme.fr/v1/entertainmentAndEvent`;
  try {
    const reponse = await fetch(url, {
        headers: {
            "X-API-Key": api_key,
        }
    });
    if (!reponse.ok) {
      throw new Error(`Statut de réponse : ${reponse.status}`);
    }

    const resultat = await reponse.json();
    console.log(resultat);
  } catch (erreur) {
    console.error(erreur.message);
  }
}
