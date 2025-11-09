import { shelterCache } from "./shelterCache";

const OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter";

const buildShelterQuery = (bounds) => {
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const east = bounds.getEast();

  return `
    [out:json][timeout:25];
    (
      node["social_facility"="homeless_shelter"](${south},${west},${north},${east});
      way["social_facility"="homeless_shelter"](${south},${west},${north},${east});
      relation["social_facility"="homeless_shelter"](${south},${west},${north},${east});
      node["amenity"="social_facility"]["social_facility"="shelter"](${south},${west},${north},${east});
      way["amenity"="social_facility"]["social_facility"="shelter"](${south},${west},${north},${east});
      relation["amenity"="social_facility"]["social_facility"="shelter"](${south},${west},${north},${east});
      node["amenity"="social_facility"]["social_facility"="shelter"]["social_facility:for"~"homeless"](${south},${west},${north},${east});
      way["amenity"="social_facility"]["social_facility"="shelter"]["social_facility:for"~"homeless"](${south},${west},${north},${east});
      relation["amenity"="social_facility"]["social_facility"="shelter"]["social_facility:for"~"homeless"](${south},${west},${north},${east});
      node["social_facility"="temporary_shelter"]["social_facility:for"~"homeless"](${south},${west},${north},${east});
      way["social_facility"="temporary_shelter"]["social_facility:for"~"homeless"](${south},${west},${north},${east});
      relation["social_facility"="temporary_shelter"]["social_facility:for"~"homeless"](${south},${west},${north},${east});
      node["amenity"="shelter"]["shelter_type"~"homeless|emergency"]["social_facility:for"~"homeless"](${south},${west},${north},${east});
      way["amenity"="shelter"]["shelter_type"~"homeless|emergency"]["social_facility:for"~"homeless"](${south},${west},${north},${east});
      relation["amenity"="shelter"]["shelter_type"~"homeless|emergency"]["social_facility:for"~"homeless"](${south},${west},${north},${east});
      node["amenity"="shelter"]["shelter_type"="homeless"](${south},${west},${north},${east});
      way["amenity"="shelter"]["shelter_type"="homeless"](${south},${west},${north},${east});
      relation["amenity"="shelter"]["shelter_type"="homeless"](${south},${west},${north},${east});
      node["amenity"="shelter"]["shelter_type"!~"^(gazebo|public_transport|bus_stop)$"](${south},${west},${north},${east});
      way["amenity"="shelter"]["shelter_type"!~"^(gazebo|public_transport|bus_stop)$"](${south},${west},${north},${east});
      relation["amenity"="shelter"]["shelter_type"!~"^(gazebo|public_transport|bus_stop)$"](${south},${west},${north},${east});
    );
    out center tags;
  `;
};

const normaliseElement = (element) => {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return null;
  }

  const tags = element.tags ?? {};

  const shelterType = tags["shelter_type"]?.toLowerCase();

  if (tags.amenity === "shelter" && ["gazebo", "public_transport", "bus_stop"].includes(shelterType)) {
    return null;
  }

  const capacity =
    tags["capacity:persons"] ||
    tags.capacity ||
    tags["capacity:bed"] ||
    tags["capacity:beds"] ||
    null;

  const status =
    tags["capacity:status"] ||
    tags["operational_status"] ||
    (tags["opening_hours"] ? `Hours: ${tags["opening_hours"]}` : null);

  const services = (tags["social_facility:service"] || "")
    .split(";")
    .map((service) => service.trim().toLowerCase())
    .filter(Boolean);

  const foodTag = tags["service:food"];
  const providesFood =
    foodTag === "yes"
      ? true
      : foodTag === "no"
      ? false
      : services.some((service) =>
          ["food", "soup_kitchen", "meal", "nutrition"].includes(service)
        )
      ? true
      : null;

  const medicalTag = tags["service:medical"];
  const providesMedical =
    medicalTag === "yes"
      ? true
      : medicalTag === "no"
      ? false
      : services.some((service) =>
          ["medical", "health", "clinic", "healthcare"].includes(service)
        )
      ? true
      : null;

  const description =
    tags.description ||
    tags.note ||
    tags["short_description"] ||
    null;

  return {
    id: `${element.type}/${element.id}`,
    latitude,
    longitude,
    name: tags.name || "Shelter",
    address:
      tags["addr:full"] ||
      [tags["addr:housenumber"], tags["addr:street"]]
        .filter(Boolean)
        .join(" ") ||
      tags["addr:street"],
    tags,
    capacity,
    status,
    providesFood,
    providesMedical,
    description,
  };
};

export const fetchShelters = async (bounds, { signal } = {}) => {
  if (!bounds) {
    throw new Error("Bounds are required to query Overpass API");
  }

  // Convert Leaflet bounds to simple object for cache key
  const boundsObj = {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };

  // Check cache first
  const cached = shelterCache.get(boundsObj);
  if (cached) {
    return cached;
  }

  const query = buildShelterQuery(bounds);

  const response = await fetch(OVERPASS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: query,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Overpass API request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (!data?.elements) {
    return [];
  }

  const deduped = new Map();

  data.elements.forEach((element) => {
    const normalised = normaliseElement(element);

    if (normalised) {
      deduped.set(normalised.id, normalised);
    }
  });

  const results = Array.from(deduped.values());

  // Store in cache
  shelterCache.set(boundsObj, results);

  return results;
};