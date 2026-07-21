const calculateDistance = (latitude1, longitude1, latitude2, longitude2) => {
  const earthRadius = 6371e3;
  const firstLatitude = (latitude1 * Math.PI) / 180;
  const secondLatitude = (latitude2 * Math.PI) / 180;
  const latitudeDifference = ((latitude2 - latitude1) * Math.PI) / 180;
  const longitudeDifference = ((longitude2 - longitude1) * Math.PI) / 180;

  const value =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDifference / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

export const getNearestAreas = (areas, latitude, longitude, limit = 3) =>
  areas
    .filter((area) => Number.isFinite(area.latitude) && Number.isFinite(area.longitude))
    .map((area) => ({
      ...area,
      distance: calculateDistance(
        latitude,
        longitude,
        area.latitude,
        area.longitude,
      ),
    }))
    .sort((first, second) => first.distance - second.distance)
    .slice(0, limit);
