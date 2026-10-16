import { DATATOURISME_API_KEY } from "./config.js";
import { addDays, toIsoDate } from "./utils.js";

const API_URL = "https://api.datatourisme.fr/v1/entertainmentAndEvent";

export const CATEGORY_TYPES = {
  concert: ["Concert", "MusicEvent"],
  expo: ["Exhibition", "ExhibitionEvent"],
  "vide-grenier": ["GarageSale", "BricABrac"],
  fete: ["Market", "Festival", "SocialEvent", "Parade", "FairOrShow"],
  spectacle: ["ShowEvent"]
};

export const CATEGORY_LABELS = {
  concert: "Concert",
  expo: "Exposition",
  "vide-grenier": "Vide-grenier",
  fete: "Fête locale",
  spectacle: "Spectacle",
  autre: "Sortie"
};

const range = (from, to) => ({ start: toIsoDate(addDays(from)), end: toIsoDate(addDays(to)) });

function getPeriod(when, date) {
  const day = new Date().getDay();

  if (when === "date") return { start: date, end: date };
  if (when === "today") return range(0, 0);
  if (when === "tomorrow") return range(1, 1);
  if (when === "weekend") return day === 0 ? range(0, 0) : range(6 - day, 7 - day);
  return range(0, 6);
}

function getDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getCategory(types, chosenCategories) {
  const order = [...chosenCategories, ...Object.keys(CATEGORY_TYPES)];
  return order.find((key) => CATEGORY_TYPES[key].some((type) => types.includes(type))) ?? "autre";
}

function toEvent(item, period, city, categories) {
  const [cityLon, cityLat] = city.centre.coordinates;
  const place = item.isLocatedAt?.[0];

  const dates = item.takesPlaceAt ?? [];
  const matchingDate = dates
    .filter((d) => d.endDate >= period.start && d.startDate <= period.end)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0] ?? dates[0] ?? {};

  return {
    id: item.uuid,
    title: item.label?.["@fr"] ?? "Sans titre",
    category: getCategory(item.type ?? [], categories),
    description: item.hasDescription?.[0]?.shortDescription?.["@fr"] ?? "",
    startDate: matchingDate.startDate < period.start ? period.start : matchingDate.startDate,
    endDate: matchingDate.endDate,
    startTime: matchingDate.startTime ?? "",
    endTime: matchingDate.endTime ?? "",
    address: place?.address?.[0]?.streetAddress?.[0] ?? "",
    town: place?.address?.[0]?.addressLocality ?? "",
    distance: place?.geo ? Math.round(getDistance(cityLat, cityLon, place.geo.latitude, place.geo.longitude)) : null
  };
}

export async function fetchEvents({ city, when, date, categories, radius }, page) {
  const period = getPeriod(when, date);
  const [lon, lat] = city.centre.coordinates;
  const types = categories.flatMap((category) => CATEGORY_TYPES[category]);

  let filters = `takesPlaceAt.endDate[gte]=${period.start} AND takesPlaceAt.startDate[lte]=${period.end}`;
  if (types.length > 0) filters += ` AND type[in]=${types.join(",")}`;

  const params = new URLSearchParams({
    geo_distance: `${lat},${lon},${radius}km`,
    filters,
    fields: "uuid,label,type,takesPlaceAt,isLocatedAt,hasDescription",
    lang: "fr",
    page_size: 10,
    page
  });

  const response = await fetch(`${API_URL}?${params}`, { headers: { "X-API-Key": DATATOURISME_API_KEY } });
  if (!response.ok) throw new Error(`Erreur API DATAtourisme : ${response.status}`);

  const { objects, meta } = await response.json();

  return {
    events: objects.map((item) => toEvent(item, period, city, categories)),
    total: meta.total,
    page: meta.page,
    totalPages: meta.total_pages
  };
}
