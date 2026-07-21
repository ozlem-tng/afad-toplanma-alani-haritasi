const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const parsePointWkt = (pointWkt) => {
  if (!pointWkt) return { latitude: null, longitude: null };

  const match = pointWkt.match(
    /^POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)$/i,
  );

  if (!match) return { latitude: null, longitude: null };

  return {
    longitude: Number(match[1]),
    latitude: Number(match[2]),
  };
};

const normalizeToplanmaAlanlari = (rows) =>
  (rows || []).map((row) => {
    const coordinates = parsePointWkt(row.pointWkt);

    return {
      recordKey: String(row.id),
      id: row.id,
      name: row.name,
      type: row.alanTur,
      areaSize: Number(row.alanM2) || 0,
      neighborhood: row.mahalleAdi || '',
      district: row.ilceAdi || '',
      capacity: Number(row.kapasite) || 0,
      pointWkt: row.pointWkt,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      availability: 'available',
    };
  });

export const fetchGatheringAreas = async () => {
  const response = await fetch(`${API_BASE_URL}/api/toplanma-alanlari`);

  if (!response.ok) {
    throw new Error('Toplanma alanları PostgreSQL üzerinden alınamadı.');
  }

  return normalizeToplanmaAlanlari(await response.json());
};
