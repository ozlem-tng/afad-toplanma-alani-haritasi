import areas from "../mock/ankaraAreas_realistic_mock.json";

/**
 * İki koordinat arasındaki kuş uçuşu mesafeyi (metre) hesaplar.
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;

  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Kullanıcının konumuna göre
 * en yakın 3 AKTİF toplanma alanını döndürür.
 */
export const getNearestAreas = async (latitude, longitude) => {
  const availableAreas = areas.filter(
    (area) => area.availability === "available"
  );

  const sortedAreas = availableAreas
    .map((area) => ({
      ...area,
      distance: calculateDistance(
        latitude,
        longitude,
        area.latitude,
        area.longitude
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return sortedAreas;
};