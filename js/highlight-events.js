export async function getHighlightEvents() {
  const api_key = "8bd12b78-f73f-49b1-a8c7-12aecdf7d4fe";  
  const url = `https://api.datatourisme.fr/v1/entertainmentAndEvent?department=37`;
  try {
    const response = await fetch(url, {
        headers: {
            "X-API-Key": api_key,
        }
    });
    if (!response.ok) {
      throw new Error(`Statut de réponse : ${response.status}`);
    }

    const resultat = await response.json();
    // console.log("rtrt" + typeof(resultat));

    function getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }

    let indexes = [getRandomArbitrary(0, resultat.meta.page_size)];
    console.log(Object.keys(resultat).length);
    

    // console.log(resultat);
    console.log(Date.now().toLocaleString());
    
  } catch (erreur) {
    console.error(erreur.message);
  }
}
