// Local mock "API" with client-side filtering. No network calls.

const MOCK_PETS = [
  { id: 1, name: "Bella louis gabriel kab", image: "https://placekitten.com/400/300", age: "2y", breed: "Persian Cat", gender: "female", category: "cat", size: "small", activity: "low", ageGroup: "adult", distanceKm: 5, distance: "5 km" },
  { id: 2, name: "Max", image: "https://placekitten.com/401/300", age: "1y", breed: "Golden Retriever", gender: "male", category: "dog", size: "large", activity: "high", ageGroup: "young", distanceKm: 12, distance: "12 km" },
  { id: 3, name: "Milo", image: "https://placekitten.com/402/300", age: "3y", breed: "Mixed", gender: "male", category: "cat", size: "medium", activity: "medium", ageGroup: "adult", distanceKm: 8, distance: "8 km" },
  { id: 4, name: "Luna", image: "https://placekitten.com/403/300", age: "1m", breed: "Rabbit", gender: "female", category: "rabbit", size: "small", activity: "low", ageGroup: "baby", distanceKm: 4, distance: "4 km" },
  { id: 5, name: "Nemo", image: "https://picsum.photos/400/300", age: "6m", breed: "Goldfish", gender: "female", category: "fish", size: "small", activity: "low", ageGroup: "baby", distanceKm: 3, distance: "3 km" },
  { id: 6, name: "Rocky", image: "https://placekitten.com/404/300", age: "4y", breed: "German Shepherd", gender: "male", category: "dog", size: "large", activity: "high", ageGroup: "adult", distanceKm: 18, distance: "18 km" },
  { id: 7, name: "Coco", image: "https://placekitten.com/405/300", age: "7y", breed: "Parrot", gender: "female", category: "bird", size: "small", activity: "medium", ageGroup: "senior", distanceKm: 7, distance: "7 km" },
  { id: 8, name: "Hammy", image: "https://placekitten.com/406/300", age: "1y", breed: "Syrian Hamster", gender: "male", category: "hamster", size: "small", activity: "medium", ageGroup: "young", distanceKm: 2, distance: "2 km" }
];

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const matchesFilters = (pet, f = {}) => {
  if (f.category && pet.category !== f.category) return false;
  if (f.gender && pet.gender !== f.gender) return false;
  if (f.size && pet.size !== f.size) return false;
  if (f.activity && pet.activity !== f.activity) return false;
  if (f.age && pet.ageGroup !== f.age) return false;
  if (f.distance != null && Number.isFinite(Number(f.distance)) && pet.distanceKm > Number(f.distance)) return false;
  if (f.search) {
    const q = String(f.search).toLowerCase();
    const hay = `${pet.name} ${pet.breed}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
};

export async function fetchPets(filters = {}, signal) {
  // mimic a tiny network delay & support abort
  await delay(150);
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const items = MOCK_PETS.filter((p) => matchesFilters(p, filters));
  return { items, total: items.length };
}
