/
 
// ---------- 1. RÉGLAGES ----------
 
const API_URL = "https://api.datatourisme.fr/v1/entertainmentAndEvent?department=37&fields=uuid,label,takesPlaceAt,hasDescription,isLocatedAt&page_size=100";
const API_KEY = "a1eaf35f-0c38-4fd4-8826-2aae9ab316ac";
 
 
// ---------- 2. OUTILS POUR LIRE LES DONNÉES ----------
 
// L'API range les textes dans des tableaux ou des objets, par exemple :
//   { fr: ["Marché de Noël"] }   ou   ["Tours"]   ou   "Tours"
// Cette fonction sort le texte, quelle que soit la forme.
function lireTexte(valeur) {
  if (!valeur) return "";
 
  // si c'est un tableau, on prend le premier élément
  if (Array.isArray(valeur)) {
    valeur = valeur[0];
  }
  if (!valeur) return "";
 
  // si c'est un objet avec une clé "fr", on prend la version française
  if (typeof valeur === "object" && valeur.fr) {
    valeur = valeur.fr;
  }
 
  // la version française est souvent un tableau aussi
  if (Array.isArray(valeur)) {
    valeur = valeur[0];
  }
  if (!valeur) return "";
 
  return String(valeur);
}
 
// Transforme "2026-12-05" en "5 décembre 2026"
function formaterDate(texte) {
  if (texte === "") return "";
  const date = new Date(texte);
  if (isNaN(date.getTime())) {
    return texte; // date illisible : on affiche le texte tel quel
  }
  return date.toLocaleDateString("fr-FR", { dateStyle: "long" });
}
 
 
// ---------- 3. TRANSFORMER UN ÉVÉNEMENT DE L'API EN OBJET SIMPLE ----------
 
function lireEvenement(brut) {
  const ev = {
    titre: lireTexte(brut.label),
    debut: "",
    fin: "",
    rue: "",
    ville: "",
    description: "",
    image: ""
  };
 
  // --- les dates ---
  // takesPlaceAt est une liste de périodes. On garde le début le plus tôt
  // et la fin la plus tard.
  const periodes = brut.takesPlaceAt;
  if (Array.isArray(periodes)) {
    for (let i = 0; i < periodes.length; i++) {
      const debut = lireTexte(periodes[i].startDate);
      const fin = lireTexte(periodes[i].endDate);
 
      if (debut !== "" && (ev.debut === "" || debut < ev.debut)) {
        ev.debut = debut;
      }
      if (fin !== "" && (ev.fin === "" || fin > ev.fin)) {
        ev.fin = fin;
      }
    }
  }
 
  // --- l'adresse ---
  // chemin : isLocatedAt → [0] → address → [0] → streetAddress / addressLocality
  const lieux = brut.isLocatedAt;
  if (Array.isArray(lieux) && lieux.length > 0) {
    const adresses = lieux[0].address;
    if (Array.isArray(adresses) && adresses.length > 0) {
      ev.rue = lireTexte(adresses[0].streetAddress);
      ev.ville = lireTexte(adresses[0].addressLocality);
    }
  }
 
  // --- la description (seulement si tu ajoutes shortDescription dans fields=) ---
  ev.description = lireTexte(brut.shortDescription);
 
  // --- l'image (seulement si tu ajoutes hasRepresentation dans fields=) ---
  // chemin : hasRepresentation → [0] → hasRelatedResource → [0] → locator
  // ⚠️ à vérifier avec le JSON brut de la page de test
  const representations = brut.hasRepresentation;
  if (Array.isArray(representations) && representations.length > 0) {
    const ressources = representations[0].hasRelatedResource;
    if (Array.isArray(ressources) && ressources.length > 0) {
      ev.image = lireTexte(ressources[0].locator);
    }
  }
 
  return ev;
}
 
 
// ---------- 4. L'ÉVÉNEMENT EST-IL TERMINÉ ? ----------
 
function estPasse(ev) {
  // on regarde la date de fin, ou la date de début s'il n'y a pas de fin
  let reference = ev.fin;
  if (reference === "") {
    reference = ev.debut;
  }
  if (reference === "") {
    return false; // pas de date : on le garde
  }
 
  const date = new Date(reference);
  if (isNaN(date.getTime())) {
    return false; // date illisible : on le garde
  }
 
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
 
  return date < aujourdhui;
}
 
 
// ---------- 5. AFFICHER LES CARTES ----------
// list      : le tableau d'événements de l'API
// container : l'élément de la page où mettre les cartes
// showPast  : true pour afficher aussi les événements passés
// Renvoie le nombre de cartes affichées.
 
function renderEvents(list, container, showPast) {
  // a) on prépare la liste des événements à afficher
  const aAfficher = [];
  for (let i = 0; i < list.length; i++) {
    const ev = lireEvenement(list[i]);
 
    if (estPasse(ev) && !showPast) {
      continue; // événement terminé : on passe au suivant
    }
    aAfficher.push(ev);
  }
 
  // b) on trie par date de début (le plus proche en premier)
  aAfficher.sort(function (a, b) {
    if (a.debut < b.debut) return -1;
    if (a.debut > b.debut) return 1;
    return 0;
  });
 
  // c) on vide le conteneur
  container.textContent = "";
 
  // d) on crée une carte par événement
  for (let i = 0; i < aAfficher.length; i++) {
    const ev = aAfficher[i];
 
    // la carte
    const carte = document.createElement("div");
    carte.className = "event";
 
    // l'image (si elle existe et en https)
    if (ev.image.startsWith("https://")) {
      const img = document.createElement("img");
      img.src = ev.image;
      img.alt = ev.titre;
      carte.appendChild(img);
    }
 
    // le contenu de la carte
    const contenu = document.createElement("div");
    contenu.className = "eventBody";
 
    // la date
    const date = document.createElement("time");
    date.className = "dateTime";
    if (ev.debut === "") {
      date.textContent = "Date à confirmer";
    } else if (ev.fin !== "" && ev.fin !== ev.debut) {
      date.textContent = formaterDate(ev.debut) + " → " + formaterDate(ev.fin);
    } else {
      date.textContent = formaterDate(ev.debut);
    }
    contenu.appendChild(date);
 
    // la ville
    const ville = document.createElement("h3");
    ville.className = "eventType";
    if (ev.ville !== "") {
      ville.textContent = "#" + ev.ville;
    }
    contenu.appendChild(ville);
 
    // le titre
    const titre = document.createElement("h2");
    titre.className = "eventTitle";
    titre.textContent = ev.titre;
    contenu.appendChild(titre);
 
    // la description (seulement s'il y en a une)
    if (ev.description !== "") {
      const description = document.createElement("p");
      description.className = "descriptif";
      description.textContent = ev.description;
      contenu.appendChild(description);
    }
 
    // l'adresse
    const adresse = document.createElement("p");
    adresse.className = "eventAddress";
    adresse.textContent = ev.rue;
    contenu.appendChild(adresse);
 
    // le lien vers la carte (seulement s'il y a une adresse)
    if (ev.rue !== "" || ev.ville !== "") {
      const lien = document.createElement("a");
      lien.className = "maps";
      lien.textContent = "Voir sur la carte";
      lien.href = "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(ev.rue + " " + ev.ville);
      lien.target = "_blank";
      lien.rel = "noopener";
      contenu.appendChild(lien);
    }
 
    // on assemble : contenu → carte → conteneur
    carte.appendChild(contenu);
    container.appendChild(carte);
  }
 
  return aAfficher.length;
}
 
 
// ---------- 6. APPELER L'API ----------
// Renvoie { list: [...événements...], data: réponse complète }
 
async function fetchEvents(apiKey) {
  if (!apiKey) {
    apiKey = API_KEY;
  }
 
  const reponse = await fetch(API_URL, {
    headers: { "X-API-Key": apiKey }
  });
 
  if (!reponse.ok) {
    throw new Error("Erreur API : " + reponse.status);
  }
 
  const data = await reponse.json();
 
  // les événements sont dans data.objects
  let list = [];
  if (Array.isArray(data.objects)) {
    list = data.objects;
  }
 
  return { list: list, data: data };
}
 
 
// ---------- 7. À APPELER SUR TA VRAIE PAGE ----------
 
async function initEvents() {
  const container = document.querySelector(".objects");
  if (!container) {
    return; // pas de conteneur sur cette page
  }
 
  try {
    const resultat = await fetchEvents();
    renderEvents(resultat.list, container, false);
  } catch (erreur) {
    console.error(erreur);
    container.textContent = "Impossible de charger les événements pour le moment.";
  }
}
 
